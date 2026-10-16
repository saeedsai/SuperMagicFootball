#!/usr/bin/env python3
"""Audit every club's positional FC27 selection; never turn a guess into an EA rating.

This validates the *third-party September snapshot* separately from live EA.
It records unresolved positions, source origin and any stronger unused candidates.
"""
import collections, csv, io, json
from pathlib import Path
from update_all_clubs_fc27 import URL, QUOTAS, ROOT, clean, fetch, make_candidate, match_club

def audit():
    raw = list(csv.DictReader(io.StringIO(fetch(URL).decode("utf-8-sig"))))
    def men(r):
        gender=(r.get("gender") or "").lower()
        league=(r.get("league") or "").lower()
        return gender not in {"female","f","woman","women","women's football","w"} and not any(t in league for t in ("women","female","femenin","frauenliga"))
    pool=collections.defaultdict(list)
    for r in raw:
        if men(r) and r.get("club"):
            pool[clean(r["club"])].append(r)
    teams={t["id"]:t for t in json.loads((ROOT/"data/teams.json").read_text())}
    report=json.loads((ROOT/"docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json").read_text())
    missing=[]
    source_issues=[]
    for group in ("club26","continental"):
        data=json.loads((ROOT/"data/players"/(group+".json")).read_text())
        for team_id,roster in data.items():
            team=teams[team_id]
            if len(roster)!=12 or any(sum(p["role"]==role for p in roster)!=size for role,size in QUOTAS.items()):
                raise AssertionError("Broken positional quota: "+team_id)
            if report[team_id]["selected"]!=[{"name":p["name"],"role":p["role"],"rating":p["rating"]} for p in roster]:
                raise AssertionError("Stale audit: "+team_id)
            anonymous=[p for p in roster if p.get("fictional") or "academy" in p["name"].lower()]
            if anonymous:missing.append({"teamId":team_id,"team":team["name"],"missing":len(anonymous),
                                          "missingRoles":dict(collections.Counter(p["role"] for p in anonymous)),
                                          "source":report[team_id].get("source")})
            key=match_club(team["name"],pool)
            if not key:continue
            candidates=[make_candidate(r) for r in pool[key]]
            candidates=[p for p in candidates if p]
            current={clean(p["name"]) for p in roster}
            for role,quota in QUOTAS.items():
                options=sorted((p for p in candidates if role in p["eligibleRoles"]),
                               key=lambda p:(-p["rating"], p["role"]!=role,clean(p["name"])))
                # Top candidate for each positional group must be retained.
                # If a multi-position star is assigned elsewhere in same team, retain as covered.
                if options and clean(options[0]["name"]) not in current:
                    source_issues.append({"teamId":team_id,"team":team["name"],"role":role,
                        "unselectedBest":options[0]["name"],"ovr":options[0]["rating"]})
    status={"clubs":len(report),"positions":sum(len(x["selected"]) for x in report.values()),
            "fc27Clubs":sum(x["origin"].startswith("FC27") for x in report.values()),
            "missingClubs":len(missing),"missingSlots":sum(x["missing"] for x in missing),
            "uncapturedTopCandidates":len(source_issues),
            "rosterGaps":missing,"topOmissions":source_issues,
            "fc27Input":"Third-party September 2026 snapshot; not independently certified as EA official"}
    out=ROOT/"docs/CLUB_FC27_POSITIONAL_AUDIT_20261015.json"
    out.write_text(json.dumps(status,indent=2,ensure_ascii=False)+"\n")
    lines=["# All-club positional FC27 audit","",
           "Source: third-party September 2026 FC27 dataset; editorial fallbacks are *not* EA ratings.","",
           f"- Clubs: {status['clubs']}; roster slots: {status['positions']}",
           f"- FC27-sourced clubs: {status['fc27Clubs']}",
           f"- Clubs with unresolved names: {status['missingClubs']}; unresolved slots: {status['missingSlots']}",
           f"- Uncaptured highest-rated candidates from matched source clubs: {status['uncapturedTopCandidates']}","",
           "## Source-ranked positional omissions"]
    for v in source_issues:
        lines.append(f"- {v['team']} ({v['role']}): {v['unselectedBest']} OVR {v['ovr']}")
    lines.extend(["","## Unresolved sourced-name positions"])
    for v in missing:
        lines.append(f"- {v['team']}: {v['missing']} ({v['missingRoles']})")
    lines.extend(["","Missing source-backed names remain explicitly marked fictional. Not a fully real-player roster.",""])
    (ROOT/"docs/CLUB_FC27_POSITIONAL_AUDIT_20261015.md").write_text("\n".join(lines))
    print("ALL_CLUB_POSITIONAL_AUDIT",json.dumps({k:v for k,v in status.items() if k not in ("rosterGaps","topOmissions")}),flush=True)
    for omission in source_issues:print("TOP_OMISSION",json.dumps(omission,ensure_ascii=False),flush=True)
    return 0 if not source_issues else 1

if __name__=="__main__":
    raise SystemExit(audit())
