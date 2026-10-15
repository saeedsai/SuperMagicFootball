#!/usr/bin/env python3
"""Validate parallel data edits before merging; no external dependencies."""
from pathlib import Path
from collections import Counter
import json,sys,math
root=Path(__file__).resolve().parents[1];get=lambda rel:json.loads((root/'data'/rel).read_text())
errors=[]
def require(ok,msg):
 if not ok:errors.append(msg)
team=get('teams.json');groups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime']
rosters={};owners={};totals={}
for group in groups:
 v=get(f'players/{group}.json');totals[group]=len(v)
 for tid,players in v.items():
  require(tid not in rosters,f'Duplicate team roster {tid}');rosters[tid]=players;owners[tid]=group
require(len(team)==223,'Expected exactly 223 built-in teams')
require(len(set(t['id'] for t in team))==len(team),'Team IDs not unique')
require(len(rosters)==len(team),'Roster/team count mismatch')
require([t['id'] for t in team][:13]==['japan','korea','thailand','mongolia','cameroon','newguinea','senegal','argentina','mexico','brazil','england','germany','italy'],'Legacy arcade ID order changed')
require([t['id'] for t in team][216:]==['bpw_wc_1998','bpw_wc_2002','bpw_wc_2006','bpw_wc_2010','bpw_wc_2014','bpw_wc_2018','bpw_alltime_legendary_12'],'BPW index order changed')
for i,t in enumerate(team):
 tid=t['id'];require(t.get('index')==i, f'Index changed for {tid}');require(tid in rosters, f'Roster missing for {tid}')
 if tid not in rosters:continue
 p=rosters[tid];require(len(p)==12,f'{tid}: wrong number of players {len(p)}')
 require(Counter(x.get('role') for x in p)==Counter({'GK':2,'DF':3,'MF':4,'FW':3}),f'{tid}: invalid role quota')
 require(len(set(x.get('id') for x in p))==len(p),f'{tid}: repeated player IDs')
 require(all(x.get('id') and x.get('name') for x in p),f'{tid}: blank player identity')
 require(owners.get(tid)==(t.get('group') or 'arcade'),f'{tid}: wrong data shard')
mechanics=get('mechanics/gameplay.json');graphics=get('graphics/procedural_assets.json')
balance=mechanics.get('engineBalance',{})
bounds={'attackingStoppageProgress':(0.50,0.90),'superKnockbackReferencePower':(30,140),'superKnockbackPowerSpan':(1,250),'superKnockbackLevelFactor':(0,0.7),'superKnockbackStrengthFactor':(0,0.05),'superKnockbackMax':(0.5,8),'keeperPredictionMaxSeconds':(0.25,1.5)}
for key,(minimum,maximum) in bounds.items():
 value=balance.get(key)
 require(isinstance(value,(float,int)) and math.isfinite(value) and minimum<=value<=maximum,f'Out of range engineBalance.{key}: {value}')
require(mechanics['defaultOptions'].get('showPerformance') is False,'Performance HUD must default off')
require(len(mechanics.get('formations',{}))==6,'Need exactly six formations')
for k,slots in mechanics.get('formations',{}).items():require(len(slots)==6 and all(0<=v[c]<=1 for v in slots for c in ('x','y')),f'Bad formation {k}')
require(len(mechanics.get('aiLevels',[]))==5,'Wrong difficulty count')
require(len(mechanics.get('dribbleStyles',[]))==10,'Wrong dribble style count')
require(len(mechanics.get('ballModels',[]))==5,'Wrong ball model count')
require(len(graphics.get('studioAssetLabels',{}).get('style',[]))==13,'Wrong hairstyle count')
require(len(graphics.get('studioAssetLabels',{}).get('beard',[]))==5,'Wrong beard count')
require(len(graphics.get('skinTones',[]))>=8,'Missing skin palette')
require(len(graphics.get('hairColors',[]))>=8,'Missing hair palette')
app=get('graphics/player_appearances.json')
for tid,faces in app.items():
 require(tid in rosters,f'Artwork for unknown team: {tid}')
 require(all(pid in {p['id'] for p in rosters.get(tid,[])} for pid in faces),f'Artwork for unknown player in {tid}')
continental=get('continental_mapping.json')
require(set(continental)=={'UEFA','AFC','CAF','CONCACAF','CONMEBOL','OFC'},'Missing continental competitions')
for conf,indices in continental.items():
 require(all(isinstance(i,int) and 0<=i<216 for i in indices),f'Invalid legacy {conf} club index')
print(json.dumps({'result':'PASS' if not errors else 'FAIL','teamCount':len(team),'playerCount':sum(map(len,rosters.values())),'shards':totals,'avatarPresets':sum(len(a) for a in app.values()),'errors':errors},indent=2))
if errors:sys.exit(1)
