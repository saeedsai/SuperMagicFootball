#!/usr/bin/env python3
"""Normalize sourced player birth dates to unambiguous ISO 8601.

FC27's third-party CSV includes DD-MM-YYYY values. Canonical identity
matching expects YYYY-MM-DD; preserve source provenance and player identity.
"""
import datetime
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
files={group:ROOT/"data"/"players"/(group+".json") for group in ("club26","continental")}
registry_file=ROOT/"src"/"roster_corrections.js"
raw=registry_file.read_text()
opening=raw.index("{",raw.index("export const ROSTER_CORRECTIONS ="))
registry,tail=json.JSONDecoder().raw_decode(raw[opening:])
changed=0
for group,path in files.items():
    data=json.loads(path.read_text())
    for club,roster in data.items():
        for player in roster:
            date=player.get("birthDate")
            if isinstance(date,str) and re.fullmatch(r"\d{2}-\d{2}-\d{4}",date):
                try:
                    day,month,year=map(int,date.split("-"))
                    iso=datetime.date(year,month,day).isoformat()
                except ValueError:
                    continue
                player["birthDate"]=iso
                changed+=1
        registry[club]=roster
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
registry_file.write_text(raw[:opening]+json.dumps(registry,ensure_ascii=False,separators=(",",":"))+";\n// Source-labeled audited club rosters synchronized with data/players.\n")
print(json.dumps({"normalized_dates":changed,"clubs":sum(len(json.loads(p.read_text())) for p in files.values())}))
