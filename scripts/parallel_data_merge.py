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


def compare_directories(base_dir, ours_dir, theirs_dir, paths=DATA_FILES):
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
        if rel.startswith('data/players/') and isinstance(objects[0], dict) and isinstance(result, dict):
            if set(objects[0]) != set(result):
                conflicts.append({'path': rel, 'reason': 'protected team roster IDs added/removed'})
        merged[rel] = result
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
    merged, conflicts = compare_directories(args.base, args.ours, args.theirs)
    result = {'status': 'CONFLICT' if conflicts else 'PASS', 'files': len(merged),
              'protectedFiles': list(DATA_FILES), 'conflictCount': len(conflicts), 'conflicts': conflicts}
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