"""Append v0.8.23.1 all-time acceptance cases without rewriting historical QA cases.
Idempotent patch to the active 0.8.23 QA catalog; not a test executor.
"""
from pathlib import Path
import csv,json,collections
root=Path(__file__).resolve().parents[1];p=root/'docs/MASTER_QA_TEST_CASES_v08221.csv'
with p.open(newline='') as f:
 reader=csv.DictReader(f);header=reader.fieldnames;rows=list(reader)
items=[
 ('BPW-ALL-01','Exact user-chosen 12 legends and rank order','Review legend squad','All 12 names, in exact user-specified order'),
 ('BPW-ALL-02','2 GK, 3 DF, 4 MF, 3 FW','Inspect BPW all-time team','All 12 positions are correct, including Messi as MF'),
 ('BPW-ALL-03','98/99 exact legendary ratings','Inspect all 12 player cards','Yashin 99, Buffon 98, Beckenbauer 99, Maldini 99, Ramos 98, all others 99'),
 ('BPW-ALL-04','Nine historical nationality codes incl USSR','Inspect all-time squad nationalities','USSR recorded as SU and nine nationalities represented'),
 ('BPW-ALL-05','Seventh BPW team is separate category','Filter Quick Match home and away teams','The six World Cup teams remain separate and an all-time category selects the new team'),
 ('BPW-ALL-06','Backward compatible team and player slots','Compare old saves, clubs and six WC indexes','Existing indexes and original team IDs unchanged; stable new ID appended'),
 ('BPW-ALL-07','Match works for either side','Kick off home and away against arcade team','12 players, correct goalkeeper and no JS crash'),
 ('BPW-ALL-08','Formation manager, face previews and calculated OVR','Open All-Time roster and formation selector','12 cartoons, six field portraits, separate legendary rating and stat-based OVR'),
 ('BPW-ALL-09','Existing Super attack and controls unchanged','Run four-button and aerial-combo regression','Four actions; special grammar unchanged'),
 ('BPW-ALL-10','Clear editorial provenance; no invented DOB or official ratings','Inspect every player metadata record','User scores kept as card ratings; no EA/FIFA claim or fabricated date of birth')]
rows=[r for r in rows if not r['test_id'].startswith('BPW-ALL-')]
for tid,title,steps,expected in items:
 rows.append(dict(test_id=tid,requirement_id='PRIORITY-BPW-ALL-TIME',area='Historical BPW',requirement=title,requirement_status='Implemented',priority='P0',test_type='unit + browser + regression',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='v0.8.23.1 + original six BPW squads',steps=steps,expected_result=expected,related_automated_scripts='v08231_bpw_alltime.mjs;v08231_bpw_alltime_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='User-created all-time selection. Legendary ratings are editorial cards, not six-stat OVR or verified EA/FIFA. Physical device unverified.'))
assert len(rows)==375,len(rows)
assert len({r['test_id'] for r in rows})==375
with p.open('w',newline='') as f:
 w=csv.DictWriter(f,header);w.writeheader();w.writerows(rows)
q=root/'docs/MASTER_QA_CATALOG_SUMMARY_v08221.json';summary=json.loads(q.read_text());summary['total']=375;summary['crosscutting']=79;summary['new_alltime_bpw_cases']=10;summary['by_area']=dict(collections.Counter(r['area'] for r in rows));summary['by_execution']=dict(collections.Counter(r['execution_status'] for r in rows));q.write_text(json.dumps(summary,indent=2)+'\n')
print('Catalog:',len(rows),'cases. Individually certified: 0; script references are not individual-case passes.')
