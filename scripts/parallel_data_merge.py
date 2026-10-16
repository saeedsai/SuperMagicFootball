#!/usr/bin/env python3
"""Conservative semantic three-way JSON merge for parallel Supermagic Football agents.

Never overwrites the game source tree. Stable teams/player IDs and roster ordering are
required because save games and UI selections use those identities/indices.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

SHARDS = ('arcade', 'national26', 'club26', 'legends', 'continental', 'bpw_worldcup', 'bpw_alltime')
DATA_FILES = ('data/teams.json', *(f'data/players/{group}.json' for group in SHARDS),
              'data/graphics/player_appearances.json', 'data/graphics/procedural_assets.json',
              'data/mechanics/gameplay.json')
_MISSING = object()


def shown(value):
    if value is _MISSING:
        return '<absent>'
    text = json.dumps(value, ensure_ascii=False, sort_keys=True)
    return text if len(text) <= 180 else text[:177] + '...'


def records(value):
    return (isinstance(value, list) and all(isinstance(x, dict) and isinstance(x.get('id'), str) for x in value)
            and len({x['id'] for x in value}) == len(value))


def merge(base, ours, theirs, location, conflicts):
    """Return the merged value (or sentinel) and collect precise field conflicts."""
    if ours == theirs:
        return ours
    if ours == base:
        return theirs
    if theirs == base:
        return ours

    if isinstance(base, dict) and isinstance(ours, dict) and isinstance(theirs, dict):
        merged = {}
        for key in dict.fromkeys((*base, *ours, *theirs)):
            value = merge(base.get(key, _MISSING), ours.get(key, _MISSING),
                          theirs.get(key, _MISSING), location + '/' + str(key), conflicts)
            if value is not _MISSING:
                merged[key] = value
        return merged

    # Treat team and roster lists as ID-indexed records but forbid positional drift.
    if records(base) and records(ours) and records(theirs):
        ids = [v['id'] for v in base]
        if [v['id'] for v in ours] != ids or [v['id'] for v in theirs] != ids:
            conflicts.append({'path': location, 'reason': 'ID membership/order changed',
                              'base': shown(ids),
                              'ours': shown([v['id'] for v in ours]),
                              'theirs': shown([v['id'] for v in theirs])})
            return base
        left, right = ({v['id']: v for v in values} for values in (ours, theirs))
        return [merge(v, left[v['id']], right[v['id']], location + '/id=' + v['id'], conflicts)
                for v in base]

    conflicts.append({'path': location, 'reason': 'both agents changed the same field',
                      'base': shown(base), 'ours': shown(ours), 'theirs': shown(theirs)})
    return base


def ids_preserved(base, merged, location, conflicts):
    """Defend against silent ID changes even when made by only one agent."""
    if records(base):
        if not records(merged) or [x['id'] for x in base] != [x['id'] for x in merged]:
            conflicts.append({'path': location, 'reason': 'protected ID membership/order changed'})
        return
    if isinstance(base, dict) and isinstance(merged, dict):
        for key in base.keys() & merged.keys():
            ids_preserved(base[key], merged[key], location + '/' + str(key), conflicts)


def changed_fields(before, after, location):
    """List semantic changed paths, respecting stable team/player IDs."""
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict):
        paths = []
        for key in sorted(before.keys() | after.keys()):
            paths.extend(changed_fields(before.get(key, _MISSING), after.get(key, _MISSING),
                                        location + '/' + str(key)))
        return paths
    if records(before) and records(after):
        if [item['id'] for item in before] == [item['id'] for item in after]:
            paths = []
            for original, updated in zip(before, after):
                paths.extend(changed_fields(original, updated, location + '/id=' + original['id']))
            return paths
    return [location]


def team_indices_preserved(base, merged, location, conflicts):
    """Stable numeric team indices protect existing saves and team selection."""
    if not (records(base) and records(merged)):
        return  # ids_preserved already reports structural changes.
    updated = {item['id']: item for item in merged}
    for original in base:
        new = updated.get(original['id'])
        if new is not None and new.get('index', _MISSING) != original.get('index', _MISSING):
            conflicts.append({'path': location + '/id=' + original['id'] + '/index',
                              'reason': 'protected team index changed',
                              'base': shown(original.get('index', _MISSING)),
                              'merged': shown(new.get('index', _MISSING))})


def validate_appearance_references(merged, conflicts):
    """Reject dangling team/player art keys before merged JSON can be staged.

    Subset-only comparisons intentionally skip this whole-dataset invariant; the
    complete dataset is also validated by scripts/validate_data.py at release.
    """
    art_path = 'data/graphics/player_appearances.json'
    required = ('data/teams.json', *(f'data/players/{group}.json' for group in SHARDS))
    if art_path not in merged or any(path not in merged for path in required):
        return
    teams = merged['data/teams.json']
    if not isinstance(teams, list):
        return  # Structural JSON validation remains the data validator's job.
    team_ids = {item['id'] for item in teams if isinstance(item, dict) and isinstance(item.get('id'), str)}
    player_ids = {}
    for group in SHARDS:
        shard = merged[f'data/players/{group}.json']
        if not isinstance(shard, dict):
            return
        for team_id, players in shard.items():
            if not isinstance(players, list):
                return
            player_ids.setdefault(team_id, set()).update(
                player['id'] for player in players
                if isinstance(player, dict) and isinstance(player.get('id'), str))
    appearances = merged[art_path]
    if not isinstance(appearances, dict):
        conflicts.append({'path': art_path, 'reason': 'graphics appearance catalog must be an object'})
        return
    for team_id, faces in appearances.items():
        team_path = art_path + '/' + str(team_id)
        if team_id not in team_ids or team_id not in player_ids:
            conflicts.append({'path': team_path, 'reason': 'graphics reference to unknown team'})
            continue
        if not isinstance(faces, dict):
            conflicts.append({'path': team_path, 'reason': 'graphics team appearance entries must be an object'})
            continue
        for player_id in faces:
            if player_id not in player_ids[team_id]:
                conflicts.append({'path': team_path + '/' + str(player_id),
                                  'reason': 'graphics reference to unknown player'})


# These are review signals, not source verification: a conflict-free merge can
# still contain an editorial player edit unsupported by updated evidence.
PLAYER_SOURCE_REVIEW_FIELDS = (
    'name', 'role', 'num', 'nation', 'age', 'birthDate', 'heightCm',
    'rating', 'fc27Id', 'fc27Position', 'fc27FaceStats',
    'power', 'shoot', 'defense',
)
PLAYER_SOURCE_EVIDENCE_FIELDS = (
    'source', 'ratingSource', 'sourceSnapshot', 'fc27OfficialCheckedAt',
    'statsVerified', 'ageVerified', 'shirtVerified', 'rosterVerification',
    'sourceClubMatch',
)


def collect_player_source_reviews(base, merged, location, results):
    """Mark source-sensitive player edits for manual review without rejecting them.

    Runs only for stable ID-preserving records: separate merge guards already
    reject structural roster changes. Evidence *updates* are not evidence
    *validity*; do not infer official source verification from this report.
    """
    if not isinstance(base, dict) or not isinstance(merged, dict):
        return
    for team_id, old_players in base.items():
        new_players = merged.get(team_id)
        if not records(old_players) or not records(new_players):
            continue
        if [p['id'] for p in old_players] != [p['id'] for p in new_players]:
            continue
        for before, after in zip(old_players, new_players):
            changed = [key for key in PLAYER_SOURCE_REVIEW_FIELDS
                       if before.get(key, _MISSING) != after.get(key, _MISSING)]
            if not changed:
                continue
            evidence_changed = [key for key in PLAYER_SOURCE_EVIDENCE_FIELDS
                                if before.get(key, _MISSING) != after.get(key, _MISSING)]
            results.append({
                'path': location + '/' + str(team_id) + '/id=' + before['id'],
                'changedFields': changed,
                'sourceMetadataChanged': evidence_changed,
                'needsSourceReview': True,
            })


def source_review_summary(entries):
    """Bound JSON report size while keeping the total number of review items."""
    return {'count': len(entries), 'entries': entries[:25],
            'truncated': len(entries) > 25}


def compare_directories(base_dir, ours_dir, theirs_dir, paths=DATA_FILES, change_report=None, source_reviews=None):
    merged, conflicts = {}, []
    for rel in paths:
        objects = []
        for label, root in [('base', base_dir), ('ours', ours_dir), ('theirs', theirs_dir)]:
            filename = Path(root) / rel
            try:
                objects.append(json.loads(filename.read_text(encoding='utf-8')))
            except (OSError, ValueError) as exc:
                conflicts.append({'path': rel, 'reason': f'{label} missing or invalid JSON: {exc}'})
                break
        if len(objects) != 3:
            continue
        result = merge(*objects, location=rel, conflicts=conflicts)
        ids_preserved(objects[0], result, rel, conflicts)
        if rel == 'data/teams.json':
            team_indices_preserved(objects[0], result, rel, conflicts)
        if change_report is not None:
            side_changes = {}
            for label, value in (('ours', objects[1]), ('theirs', objects[2]), ('merged', result)):
                fields = changed_fields(objects[0], value, rel)
                side_changes[label] = {'count': len(fields), 'paths': fields[:25],
                                       'truncated': len(fields) > 25}
            if any(entry['count'] for entry in side_changes.values()):
                change_report[rel] = side_changes
        if source_reviews is not None and rel.startswith('data/players/'):
            collect_player_source_reviews(objects[0], result, rel, source_reviews)
        if rel.startswith('data/players/') and isinstance(objects[0], dict) and isinstance(result, dict):
            if set(objects[0]) != set(result):
                conflicts.append({'path': rel, 'reason': 'protected team roster IDs added/removed'})
        merged[rel] = result
    validate_appearance_references(merged, conflicts)
    return merged, conflicts


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', type=Path, required=True, help='common ancestor source tree')
    parser.add_argument('--ours', type=Path, required=True, help='first agent source tree')
    parser.add_argument('--theirs', type=Path, required=True, help='second agent source tree')
    parser.add_argument('--out', type=Path, help='NEW EMPTY directory for merged data; never source tree')
    parser.add_argument('--report', type=Path, help='optional JSON QC report destination')
    parser.add_argument('--check', action='store_true', help='check-only; never write merged data')
    args = parser.parse_args(argv)
    # A report path is a write: never allow it to overwrite an input checkout.
    sources = [p.resolve() for p in (args.base, args.ours, args.theirs)]
    if args.report:
        report_path = args.report.resolve()
        if any(report_path == source or source in report_path.parents for source in sources):
            parser.error('--report must be outside all three input source trees')
        if args.out and (report_path == args.out.resolve() or args.out.resolve() in report_path.parents):
            parser.error('--report must not be within the merged --out directory')
    change_report, source_reviews = {}, []
    merged, conflicts = compare_directories(args.base, args.ours, args.theirs,
                                            change_report=change_report,
                                            source_reviews=source_reviews)
    result = {'status': 'CONFLICT' if conflicts else 'PASS', 'files': len(merged),
              'protectedFiles': list(DATA_FILES), 'conflictCount': len(conflicts),
              'conflicts': conflicts, 'changeSummary': change_report,
              'sourceReview': source_review_summary(source_reviews)}
    print(json.dumps(result, indent=2, ensure_ascii=False))
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    if conflicts:
        return 1
    if args.out and not args.check:
        out = args.out.resolve()
        sources = [p.resolve() for p in (args.base, args.ours, args.theirs)]
        if out in sources or any(out in path.parents or path in out.parents for path in sources):
            parser.error('--out must not be an input source tree or an ancestor of one')
        if out.exists() and any(out.iterdir()):
            parser.error('--out must not already contain files; existing files are never overwritten')
        for rel, data in merged.items():
            dst = out / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return 0


if __name__ == '__main__':
    sys.exit(main())