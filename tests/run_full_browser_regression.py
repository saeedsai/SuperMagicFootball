from pathlib import Path
import subprocess,sys,time,json
root=Path(__file__).resolve().parents[1]
names=['tactics_browser_qa.py','kits_browser_qa.py','v060_qa.py','manager_v060.py','save_filter_v060.py','ai_browser_qa.py','stats_browser_qa.py','fitness_browser_qa.py','morale_browser_qa.py','abilities_browser_qa.py','aerial_browser_qa.py','team_combos_browser_qa.py','ai_combos_browser_qa.py','four_button_browser_qa.py','collisions_browser_qa.py','four_button_phase2_browser_qa.py','dribble_styles_browser_qa.py','penalty_controls_browser_qa.py','home_dashboard_browser_qa.py']
results=[]
for name in names:
 start=time.monotonic()
 try:
  cp=subprocess.run([sys.executable,str(root/'tests'/name)],cwd=str(root),text=True,capture_output=True,timeout=50)
  status='PASS' if cp.returncode==0 else 'FAIL';err=(cp.stdout+'\n'+cp.stderr).strip()
 except subprocess.TimeoutExpired as e:
  status='TIMEOUT';err=str(e)
 results.append(dict(test=name,status=status,seconds=round(time.monotonic()-start,2),details=err[-1200:]))
 (root/'tests'/'browser_regression_v089.json').write_text(json.dumps(results,indent=2))
 print(status,name,results[-1]['seconds'],flush=True)
print('SUMMARY',len(results),sum(x['status']=='PASS' for x in results),'passed',flush=True)
