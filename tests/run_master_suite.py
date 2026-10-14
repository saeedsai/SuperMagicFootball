#!/usr/bin/env python3
"""Deterministic regression executor. Never equate catalog cases with executions.

Usage:
 python tests/run_master_suite.py --profile smoke
 python tests/run_master_suite.py --profile full --category node
 python tests/run_master_suite.py --profile full --category browser --shard-index 0 --shard-count 3
 python tests/run_master_suite.py --profile full --category browser --shard-index 1 --shard-count 3
 python tests/run_master_suite.py --profile full --category browser --shard-index 2 --shard-count 3

All commands are run in clean child processes. A failure cannot mask later tests.
Each run writes machine-readable JSON + Markdown. Timed-out/unrun tests are never PASS.
"""
from pathlib import Path
import argparse,json,re,subprocess,sys,time,datetime,shlex,collections,os,signal
ROOT=Path(__file__).resolve().parents[1]
TESTS=ROOT/'tests'
OUTPUT=ROOT/'docs'/'qa_runs';OUTPUT.mkdir(parents=True,exist_ok=True)
pkg=json.loads((ROOT/'package.json').read_text())
node_scripts=re.findall(r'node\s+tests/([\w-]+\.mjs)',pkg['scripts']['test'])
node_scripts += ['master_contracts.mjs']
browser_scripts=re.findall(r'python\s+tests/([\w-]+\.py)',pkg['scripts']['qa'])
browser_extras=['v08232_audio_storage_browser_qa.py','v0823_audio_browser_qa.py','v08231_bpw_alltime_browser_qa.py','v0824_keeper_browser_qa.py','v08206_identity_browser_qa.py','v08205_rosters_browser_qa.py','master_ui_contracts.py','v08203_rosters_browser_qa.py','v08202_rosters_browser_qa.py','v08195_overall_browser_qa.py','control_reliability_browser_qa.py','combo_priority_browser_qa.py','v08196_keeper_browser_qa.py','v08193_ui_browser_qa.py','rapid_controls_browser_qa.py','v0821_ball_lift_browser_qa.py','v08211_input_cancel_browser_qa.py','v0822_bpw_world_cups_browser_qa.py','v08221_aerial_super_browser_qa.py','v08247_menu_browser_qa.py','v08247_menu_input_browser_qa.py']
assert len(node_scripts)>=72,(len(node_scripts),node_scripts)
assert len(set(node_scripts))==len(node_scripts),'duplicate node suite entries'
assert all((TESTS/name).is_file() for name in node_scripts),'missing node scripts'
assert len(browser_scripts)==19
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--profile',choices=['smoke','full'],default='smoke')
parser.add_argument('--category',choices=['node','browser','both'],default='both')
parser.add_argument('--shard-index',type=int,default=0)
parser.add_argument('--shard-count',type=int,default=1)
parser.add_argument('--timeout',type=int,default=55)
parser.add_argument('--include',default='',help='Comma-separated exact script basenames to execute (small stable batches)')
parser.add_argument('--limit',type=int,default=0,help='Optional cap on number of scripts per process')
parser.add_argument('--tag',default='')
args=parser.parse_args()
if args.shard_count<1 or not 0<=args.shard_index<args.shard_count:parser.error('Invalid shard')
if args.profile=='smoke':
 node_scripts=[x for x in node_scripts if x in {'simulation.mjs','career.mjs','four_button_controls.mjs','combo_priority.mjs','input_buffer.mjs','v08196_keeper_prediction.mjs','v08195_overall.mjs','v08203_bayern_psg_verified.mjs','v08206_canonical_identity.mjs','master_contracts.mjs','v0822_bpw_world_cups.mjs','v08231_bpw_alltime.mjs','v08232_audio_reliability.mjs','v0823_audio.mjs','v0821_ball_lift_super_bicycle.mjs','v08211_control_cancellation_balance.mjs','v08221_aerial_super_rework.mjs','v0824_keeper_fairness.mjs','v08241_moving_keeper.mjs'}]
 browser_scripts=['v08232_audio_storage_browser_qa.py','master_ui_contracts.py','four_button_browser_qa.py','v0822_bpw_world_cups_browser_qa.py','v08231_bpw_alltime_browser_qa.py','home_dashboard_browser_qa.py','v08221_aerial_super_browser_qa.py','v08247_menu_browser_qa.py','v08247_menu_input_browser_qa.py']
else:
 browser_scripts+=browser_extras
commands=[]
if args.category in ['node','both']:
 commands += [('node',t,['node',str(TESTS/t)]) for t in node_scripts]
if args.category in ['browser','both']:
 commands += [('browser',t,[sys.executable,str(TESTS/t)]) for t in browser_scripts]
commands=[c for i,c in enumerate(commands) if i%args.shard_count==args.shard_index]
if args.include:
 names=set(args.include.split(','));commands=[c for c in commands if c[1] in names]
if args.limit>0:commands=commands[:args.limit]
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
tag=''.join(ch for ch in args.tag if ch.isalnum() or ch in '_-')[:40]
base=f'master_{args.profile}_{args.category}_s{args.shard_index}of{args.shard_count}_{tag or now}'
json_file=OUTPUT/(base+'.json');md_file=OUTPUT/(base+'.md')
meta={'suite':'Supermagic Football Master QA','release':pkg['version'],'profile':args.profile,'category':args.category,'shard':{'index':args.shard_index,'total':args.shard_count},'run_id':base,'started_utc':now,'scripts_requested':len(commands),'cases_cataloged':len((ROOT/'docs'/'MASTER_QA_TEST_CASES_v08221.csv').read_text(encoding='utf8').splitlines())-1,'cases_individually_certified':0,'results':[]}
def save():
 meta['summary']={k:sum(r['status']==k for r in meta['results']) for k in ['PASS','FAIL','TIMEOUT','ERROR']}
 meta['summary']['NOT_EXECUTED']=len(commands)-len(meta['results'])
 meta['summary']['ALL_REQUESTED_PASSED']=len(meta['results'])==len(commands) and all(r['status']=='PASS' for r in meta['results'])
 json_file.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n')
 lines=[f'# Regression run — {base}',f'**Release:** {meta["release"]}; **profile:** {args.profile}; **shard:** {args.shard_index+1}/{args.shard_count}',f'**Scripts requested:** {len(commands)}; **passed:** {meta["summary"]["PASS"]}; **failed:** {meta["summary"]["FAIL"]}; **timed out:** {meta["summary"]["TIMEOUT"]}; **not executed:** {meta["summary"]["NOT_EXECUTED"]}.','', '> Script-level results are not individual requirement certifications. Future requirements are unimplemented.','', '| Category | Executable script | Result | Seconds |','|---|---|---|---:|']
 for r in meta['results']:lines.append(f'| {r["category"]} | `{r["script"]}` | {r["status"]} | {r["seconds"]:.1f} |')
 md_file.write_text('\n'.join(lines)+'\n')
for cat,name,command in commands:
 began=time.monotonic()
 try:
  # Launch in its own session. Browser scripts can leave Chromium grandchildren
  # holding stdout/stderr; killing only the Python parent would otherwise hang.
  child=subprocess.Popen(command,cwd=ROOT,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True,env={**os.environ,'PYTHONUNBUFFERED':'1'})
  try:
   stdout,stderr=child.communicate(timeout=(args.timeout if cat=='browser' else 35))
   status='PASS' if child.returncode==0 else 'FAIL';rc=child.returncode
   out=(stdout+'\n'+stderr).strip()
  except subprocess.TimeoutExpired:
   try: os.killpg(child.pid,signal.SIGKILL)
   except ProcessLookupError: pass
   try: stdout,stderr=child.communicate(timeout=3)
   except subprocess.TimeoutExpired: stdout,stderr='','Browser subprocess did not close pipes after process-group termination'
   status='TIMEOUT';rc=None;out='Exceeded configured per-script budget; process tree terminated.\n'+(stdout+'\n'+stderr)[-2800:]
 except Exception as ex:status='ERROR';rc=None;out=repr(ex)
 result={'category':cat,'script':name,'status':status,'return_code':rc,'seconds':round(time.monotonic()-began,3),'command':' '.join(shlex.quote(p) for p in command),'output_tail':out[-4000:]}
 meta['results'].append(result);save()
 print(f'{status:7s} {cat:7s} {name:40s} {result["seconds"]:6.1f}s',flush=True)
print('REPORT',json_file,flush=True)
print('SUMMARY',meta['summary'],flush=True)
if not meta['summary']['ALL_REQUESTED_PASSED']:sys.exit(1)
