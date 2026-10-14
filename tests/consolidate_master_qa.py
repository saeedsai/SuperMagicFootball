#!/usr/bin/env python3
"""Consolidate current-release independent test-run evidence.

Only runs whose report metadata matches package release are considered. A passing
rerun can clear a script's latest verification, while earlier failures and
interrupted runs remain visible in history. Individual requirement catalog
entries are NOT inferred to pass based solely on script pass counts.
"""
from pathlib import Path
import json,re,csv,collections,datetime
root=Path(__file__).resolve().parents[1];runs=root/'docs'/'qa_runs'
pkg=json.loads((root/'package.json').read_text());release=pkg['version'].removesuffix('-alpha');tag='v'+release.replace('.','')
node=re.findall(r'node\s+tests/([\w-]+\.mjs)',pkg['scripts']['test'])+['master_contracts.mjs']
browser=re.findall(r'python\s+tests/([\w-]+\.py)',pkg['scripts']['qa'])
browser+=['v08206_identity_browser_qa.py','v08205_rosters_browser_qa.py','master_ui_contracts.py','v08203_rosters_browser_qa.py','v08202_rosters_browser_qa.py','v08195_overall_browser_qa.py','control_reliability_browser_qa.py','combo_priority_browser_qa.py','v08196_keeper_browser_qa.py','v08193_ui_browser_qa.py','rapid_controls_browser_qa.py','v0821_ball_lift_browser_qa.py','v08211_input_cancel_browser_qa.py','v0822_bpw_world_cups_browser_qa.py']
expected={'node':set(node),'browser':set(browser)}
assert len(expected['node'])==len(node) and len(expected['browser'])==len(browser)
source=[]
for file in sorted(runs.glob('master_full_*.json')):
 try:doc=json.loads(file.read_text())
 except (ValueError,OSError):continue
 if doc.get('release')==release:source.append((file,doc))
assert source, f'No test-run reports for {release}'
seen=collections.defaultdict(list);interrupted=[]
for path,doc in source:
 if doc.get('summary',{}).get('NOT_EXECUTED',0)>0 or doc.get('summary',{}).get('TIMEOUT',0)>0:
  interrupted.append({'run':doc.get('run_id'),'not_executed':doc['summary'].get('NOT_EXECUTED',0),'timed_out':doc['summary'].get('TIMEOUT',0)})
 for row in doc.get('results',[]):
  if row['script'] in expected.get(row['category'],set()):
   seen[(row['category'],row['script'])].append({'run_id':doc['run_id'],'status':row['status'],'seconds':row['seconds']})
per=[]
for category,names in expected.items():
 for script in sorted(names):
  evidence=seen.get((category,script),[])
  status='PASS' if any(x['status']=='PASS' for x in evidence) else ('NOT_EXECUTED' if not evidence else evidence[-1]['status'])
  per.append({'category':category,'script':script,'status':status,'history':evidence})
counts={kind:{'expected':len(expected[kind]),'passed':sum(p['status']=='PASS' for p in per if p['category']==kind),'unpassed':sum(p['status']!='PASS' for p in per if p['category']==kind)} for kind in expected}
catalog=json.loads((root/'docs'/'MASTER_QA_CATALOG_SUMMARY_v0822.json').read_text())
report={'release':release,'checked_on':'2026-10-14','script_level':counts,'distinct_scripts_expected':len(per),'distinct_scripts_passing':sum(r['status']=='PASS' for r in per),'documented_acceptance_cases':catalog['total'],'cases_individually_certified':0,'historical_requirement_cases':catalog['historical'],'future_not_shipped_cases':catalog['backlog'],'prior_or_interrupted_runs':interrupted,'all_inherited_browser_scripts_passed_at_least_once':counts['browser']['unpassed']==0,'single_uninterrupted_full_browser_run_certified':False,'physical_mobile_and_gamepad_certified':False,'evidence_file_paths':[str(p.relative_to(root)) for p,_ in source],'per_script':per,'note':'Many scripted tests contain several assertions, but cannot be equated to independent sign-off for 320 catalog cases. Longer browser runs stalled; bounded batches passed.'}
p=root/'docs'/f'MASTER_QA_EXECUTION_SUMMARY_{tag}.json';p.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
with (root/'docs'/f'MASTER_QA_SCRIPT_RESULTS_{tag}.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['category','script','status','passing_runs','other_runs']);
 for item in per:
  w.writerow([item['category'],item['script'],item['status'],';'.join(x['run_id'] for x in item['history'] if x['status']=='PASS'),';'.join(f'{x["run_id"]}:{x["status"]}' for x in item['history'] if x['status']!='PASS')])
md=['# Master QA execution summary '+release,'',f"**Passing:** {report['distinct_scripts_passing']}/{report['distinct_scripts_expected']} distinct scripts, {counts['node']['passed']}/{counts['node']['expected']} Node and {counts['browser']['passed']}/{counts['browser']['expected']} browser.",'',f"**Catalog:** {catalog['total']} documented acceptance cases. These are NOT {catalog['total']} individually executed tests.",'','**Limitations:** Physical device and gamepad QA absent; an uninterrupted all-browser-chain pass was not established. Earlier runner interruption and corrected initial regression failures remain recorded in the JSON evidence.','', '| Category | Script | Result |','|---|---|---|']
for item in per:md.append(f"| {item['category']} | `{item['script']}` | {item['status']} |")
(root/'docs'/f'MASTER_QA_EXECUTION_SUMMARY_{tag}.md').write_text('\n'.join(md)+'\n')
print(json.dumps({'release':release,'results':counts,'catalog_cases':catalog['total'],'runs':len(source),'interrupted':len(interrupted)},indent=2))
if any(c['unpassed'] for c in counts.values()):raise SystemExit(1)
