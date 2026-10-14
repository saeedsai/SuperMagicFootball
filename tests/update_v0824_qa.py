"""Idempotent v0.8.24 append-only QA catalog release update."""
from pathlib import Path
import csv,json,collections
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs'
p=DOC/'MASTER_QA_TEST_CASES_v08221.csv'
with p.open(newline='') as f:
 reader=csv.DictReader(f);headers=reader.fieldnames;rows=[r for r in reader if not r['test_id'].startswith('GK-824-')]
items=[
 ('GK-824-01','One rare automatic super-save consideration per shot','Fire eligible transformed shot over many ball frames at 120Hz','At most one 14% roll across the entire shot; no FPS-driven repeat probability','v0824_keeper_fairness.mjs;v0824_keeper_browser_qa.py'),
 ('GK-824-02','Shot eligibility and safe direction','Repeat automatic special attempt on outgoing, out-of-mouth and non-transformed balls','Super save roll is not attempted for non-threatening trajectories','v0824_keeper_fairness.mjs'),
 ('GK-824-03','New shot resets keeper super opportunity','Shoot another eligible transformed ball after previous failed chance','Fresh shot is evaluated independently, with existing keeper cooldown preserved','v0824_keeper_fairness.mjs'),
 ('GK-824-04','Synthetic matrix mirrored across both goals','Trial fixed shot lanes with rookie, elite and tired elite keeper','Both goal directions within bounded difference and stronger GK covers more ordinary lanes','v0824_keeper_fairness.mjs'),
 ('GK-824-05','Synthetic difficulty and super-shot fairness','Trial all five difficulties at controlled keeper coordinates, shot level 0,1,3,5','Higher level erratic shots not easier to save; fatigue does not improve keeper; isolated stationary save radius not secretly modified by CPU difficulty','v0824_keeper_fairness.mjs'),
 ('GK-824-06','Keeper visual recovery desktop and touch','Save an incoming ball and advance dive animation to landing','Keeper enters dive and recovery; no JS exception, four buttons remain present','v0824_keeper_browser_qa.py'),
]
for tid,title,steps,expected,scripts in items:
 rows.append(dict(test_id=tid,requirement_id='P1-GK-FAIRNESS-0824',area='Goalkeeper balance',requirement=title,requirement_status='Implemented',priority='P1',test_type='unit + browser + matrix',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='Goalkeeper available; controlled incoming ball; seeded or stubbed RNG',steps=steps,expected_result=expected,related_automated_scripts=scripts,execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Synthetic shots and offline Chromium, not measured physical keeper skill or real match save percentage.'))
assert len(rows)==389,len(rows)
assert len(set(r['test_id'] for r in rows))==389
with p.open('w',newline='') as f:
 w=csv.DictWriter(f,headers);w.writeheader();w.writerows(rows)
q=DOC/'MASTER_QA_CATALOG_SUMMARY_v08221.json';s=json.loads(q.read_text())
s.update(total=389,total_cases=389,crosscutting=93,keeper_fairness_v0824=6)
s['by_area']=dict(collections.Counter(r['area'] for r in rows));s['by_execution']=dict(collections.Counter(r['execution_status'] for r in rows))
s['note_v0824']='Six goalkeeper coverage and automatic-super eligibility requirements added. Script passes do not individually certify all catalog cases.'
q.write_text(json.dumps(s,indent=2,ensure_ascii=False)+'\n')
print('Catalog',len(rows),'(not individually executed)')
