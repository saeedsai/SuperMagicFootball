#!/usr/bin/env python3
"""Probe 2026/27 squad pages as an additional source for otherwise-unsourced clubs."""
import urllib.request,re,html
from bs4 import BeautifulSoup
for slug in ['mamelodi-sundowns','seattle-sounders','al-gharafa','power-dynamos','vancouver-fc','young-africans','kashima-antlers']:
 url='https://starting11.com/'+slug+'/squad'
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; SuperMagicFootball/1.0)'})
  with urllib.request.urlopen(req,timeout=15) as response: raw=response.read().decode('utf8')
  soup=BeautifulSoup(raw,'html.parser')
  title=soup.title.get_text(' ',strip=True) if soup.title else ''
  text=soup.get_text(' ',strip=True)
  txtpos=text.find('Goalkeepers')
  print('SQUAD_PROBE',slug,'bytes',len(raw),'title',title,'goalkeeperSection',text[txtpos:txtpos+500],flush=True)
  print('SQUAD_HTML_SAMPLE',slug,raw[raw.find('Goalkeepers')-100:raw.find('Goalkeepers')+1600][:1750],flush=True)
  for block in ['gk','def','mid','fwd']:
   section=soup.find('section',id='squad-'+block)
   if section:
    item=section.find('li')
    if item:print('SQUAD_PLAYER_LI',slug,block,str(item)[:2600],flush=True)
  for heading in soup.find_all(id=re.compile('squad-(gk|def|mid|fwd)'))[:4]:
   print('SQUAD_SECTION',slug,heading.get('id'),heading.name,str(heading)[:2300],flush=True)
  for table in soup.find_all('table')[:5]:
   print('SQUAD_TABLE',slug,str(table)[:2200],flush=True)
 except Exception as e:print('SQUAD_PROBE_ERROR',slug,str(e),flush=True)
