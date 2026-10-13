from pathlib import Path
import csv,collections,json
root=Path(__file__).resolve().parents[1]
docs=root/'docs'
old=docs/'FEATURE_MATRIX_184_ITEMS.csv'
with old.open(encoding='utf-8',newline='') as f:r=list(csv.DictReader(f))
assert len(r)==184, len(r)
for x in r:
 if x['id']=='181':x['status']='Partial';x['evidence']='v0.8.10: home dashboard grouped into 3 categories; 14 action routes retained; desktop/mobile navigation smoke passed';x['next_step']='Extend navigation to in-game submenus; accessibility and controller focus management'
 if x['id']=='182':x['status']='Partial';x['evidence']='v0.8.10: redesigned homepage hierarchy, icon tiles and quick stats; other game screens remain unchanged';x['next_step']='Create full-screen design system and reusable icon library, HUD/menus remaining'
new=[
 ('Roster integrity','Read and reconcile all 3 uploaded 2026 roster audits','Audit contains 9736 issues, 296 suggested additions, 806 review records','Stage verified corrections in review queue; do not apply automatically'),
 ('Roster integrity','Replace fictional placeholders with prioritized verified real-world candidates','296 candidate additions for 16 club teams; 113 marked critical; only 12 available per roster','Verify player membership, prioritize core 12 and record rejected candidates'),
 ('Roster integrity','Review broad positions against cited source and avoid GK/FW/DF/MF mismatches','167 position-change proposals have linked sources','Confirm each source as-of date and resolve lineup constraints'),
 ('Roster integrity','Resolve shared player identity, age and cross-team overall inconsistencies','127 age flags and 55 overall spread flags','Canonical DOB/ID, shared base ratings with documented team modifiers'),
 ('Roster integrity','Separate dated real market valuations, EA references, and in-game economy','13 market and 40 overall alignment flags in audit','Store separate EUR/date/EA metadata and game-balanced ratings'),
 ('Roster integrity','Research physical dimensions and illustration references without guessing race or appearance','2364 height missing flags; 2364 generated-appearance warnings','Verify heights, use artist-reviewed references, preserve unknown physical fields'),
 ('Data architecture','Share canonical identity across nation and club memberships; no duplicate base player objects','Current expansion creates repeat snapshots','Add global player-ID registry and team membership references, save migration'),
 ('BPW eras','Replace existing six legend teams with BPW 1998, 2002, 2006, 2010, 2016, 2020','User request; no roster change this milestone','Stage historical eligible players for each year with documented era criteria'),
 ('BPW eras','Add separate modern BPW 2026 all-stars','User request; no roster change this milestone','Select top contemporary players using transparent as-of criteria'),
 ('BPW eras','Each BPW squad has exactly 12 players: 2 GK, 3 DF, 4 MF, 3 FW','Wingers can count as MF or FW by declared primary role','Validate schema before releasing seven squads'),
 ('BPW eras','No player repeats between any of seven BPW era rosters','84 distinct BPW selection identities required','Use canonical IDs to enforce global BPW-era exclusivity'),
 ('BPW eras','BPW roster has unique higher-stat variants, distinct from same person in club/nation','Explicit exception to base identity sharing','Store variantOf canonical ID, tagged BPW year, separate attributes'),
 ('BPW eras','Every BPW player has its own distinctive recognizable cartoon face','World-class original stylization requirement','Commission/art-direct era likeness, prohibit reusing exclusive face presets'),
 ('BPW eras','Every BPW player has individual super shot or defensive/GK ability','All 84 BPW slots require approved move profiles','Build unique move registry with behavior tests and visuals'),
 ('BPW eras','Clarify 2016 and 2020 BPW labels: these are not FIFA World Cup years','FIFA World Cups in relevant era include 2014, 2018, 2022','Treat 2016 and 2020 as annual/era BPW, unless user opts for World Cup editions'),
 ('Release practice','Keep roster/BPW requests backlog-only in v0.8.10 and stage audit source references','v0.8.10 is navigation UI only','Review/approve canonical corrections in a later data-specific milestone')
]
for i,(area,feature,evidence,next_step) in enumerate(new,185):r.append(dict(id=str(i),area=area,requested_by='U',feature=feature,status='Missing',evidence=evidence,next_step=next_step))
q=docs/f'FEATURE_MATRIX_{len(r)}_ITEMS.csv'
with q.open('w',encoding='utf-8',newline='') as f:
 w=csv.DictWriter(f,fieldnames=['id','area','requested_by','feature','status','evidence','next_step']);w.writeheader();w.writerows(r)
(docs/'FEATURE_TRACKER.csv').write_bytes(q.read_bytes())
counts=collections.Counter(x['status'] for x in r)
(docs/'TRACKER_COUNTS_v089.json').write_text(json.dumps({'total':len(r),'status':dict(counts),'added':len(new),'UI_navigation':'partial','roster_game_changes':'none','bpw_game_changes':'none'},indent=2))
print('TRACKER',len(r),dict(counts))
