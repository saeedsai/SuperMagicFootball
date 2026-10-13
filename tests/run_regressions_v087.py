from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess,time
root=Path(__file__).resolve().parent
scripts=['tactics_browser_qa.py','kits_browser_qa.py','v060_qa.py','manager_v060.py','save_filter_v060.py','ai_browser_qa.py','stats_browser_qa.py','fitness_browser_qa.py','morale_browser_qa.py','abilities_browser_qa.py','aerial_browser_qa.py','team_combos_browser_qa.py','ai_combos_browser_qa.py','four_button_browser_qa.py','collisions_browser_qa.py','four_button_phase2_browser_qa.py','dribble_styles_browser_qa.py']
def run(script):
 t=time.time()
 try:
  r=subprocess.run(['python',str(root/script)],cwd=root.parent,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=110)
  return(script,r.returncode,round(time.time()-t,1),r.stdout[-3500:])
 except subprocess.TimeoutExpired as e:return(script,124,round(time.time()-t,1),'TIMEOUT:'+str(e))
results=[]
with ThreadPoolExecutor(max_workers=3) as pool:
 futs=[pool.submit(run,s) for s in scripts]
 for f in as_completed(futs):
  z=f.result();results.append(z);print(f'{z[0]}: {"PASS" if z[1]==0 else "FAIL"} {z[2]}s',flush=True)
with open(root/'RESULTS_BROWSER_v087.log','w') as f:
 for s in scripts:
  item=next(r for r in results if r[0]==s)
  f.write(f'--- {s}: {"PASS" if item[1]==0 else "FAIL"} ({item[2]}s) ---\n{item[3]}\n')
print('RESULT',sum(r[1]==0 for r in results),'/',len(results),'PASS',flush=True)
if any(r[1]!=0 for r in results):raise SystemExit(1)
