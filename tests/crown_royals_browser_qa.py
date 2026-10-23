#!/usr/bin/env python3
"""Capture literal in-game renderer screenshots; no generated art or fake approvals."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from PIL import Image,ImageChops
from playwright.sync_api import sync_playwright
import base64,hashlib,io,json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/qa_runs_crown_royals';OUT.mkdir(exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1400,'height':850},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/crown-royals-visual-qa.html')
  page.wait_for_function("document.querySelector('#status').textContent.includes('Game renderer loaded')",timeout=30000)
  frames={}
  for action in ['idle','run','jump','shoot','tackle']:
   page.click('#'+action)
   raw=page.eval_on_selector('#sheet',"(c)=>c.toDataURL('image/png').split(',')[1]")
   image=Image.open(io.BytesIO(base64.b64decode(raw))).convert('RGBA')
   assert image.size==(1300,550)
   image.save(OUT/f'alex_{action}.png')
   frames[action]=image
  assert not errors,errors
  assert len(frames['idle'].getcolors(maxcolors=1000000) or [])>30
  for action in ['run','jump','shoot','tackle']:
   assert ImageChops.difference(frames['idle'].convert('RGB'),frames[action].convert('RGB')).getbbox() is not None,action
  report={'status':'PASS for renderer smoke, NOT full animation acceptance','player':'Alex #1',
   'team':'Crown Royals (Art WIP)','true_views':['front','side','back'],
   'approximated_views':['quarterFront','quarterBack'],
   'action_animation':['experimental run','jump transform','shoot transform','tackle transform'],
   'unverified':['12 unique players','bespoke action frames','reference consistency in side hair'],
   'screenshots':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in OUT.glob('alex_*.png')}}
  (OUT/'report.json').write_text(json.dumps(report,indent=2))
  print(json.dumps(report,indent=2));browser.close()
finally:server.shutdown()
