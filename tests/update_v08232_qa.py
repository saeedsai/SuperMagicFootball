"""Idempotent append-only active QA catalog augmentation for audio reliability."""
from pathlib import Path
import csv,json,collections
root=Path(__file__).resolve().parents[1];p=root/'docs/MASTER_QA_TEST_CASES_v08221.csv'
with p.open(newline='') as f:
 reader=csv.DictReader(f);header=reader.fieldnames;rows=list(reader)
items=[
 ('AUD-232-01','Menu-to-halftime music crossfade','Switch menu scene directly to halftime with active Web Audio','Old music fades out while new motif fades in without stopping the new song'),
 ('AUD-232-02','Gameplay crowd ambience sound actually exists','Start a match after deliberate audio unlock','Original locally synthesized looping crowd is audible and no remote samples are fetched'),
 ('AUD-232-03','Crowd volume and no duplicate sources','Change ambience level, change to match twice','Gain reflects slider and exactly one crowd sound source is active'),
 ('AUD-232-04','Audio lifecycle and mute no leaks','Mute/unmute, suspend/resume and leave match','Silent mode releases music/crowd and visibility restores correct sound only when unlocked'),
 ('AUD-232-05','Settings survive rehydration and legacy option migration','Save settings, simulate new page, toggle mute on then off','Audio volumes and mute reload; legacy sfx option tracks explicit master mute'),
 ('AUD-232-06','Invalid audio saved options sanitized','Import malformed settings including false string, NaN, out-of-range volumes','Settings recover safely and literal false string is not treated as mute'),
 ('AUD-232-07','Mobile touch Web Audio unlock','Enter Settings on simulated touch Chromium and exercise unlock and lifecycle','AudioContext remains gesture gated; crowd and musical source nodes start with no JS errors'),
 ('AUD-232-08','Protected gameplay and BPW invariants unchanged','Run existing UI, combo, formation and team regressions','Four buttons, six formations, seven BPW squads and all legacy controls persist')]
rows=[r for r in rows if not r['test_id'].startswith('AUD-232-')]
for tid,title,steps,expected in items:
 rows.append(dict(test_id=tid,requirement_id='P1-AUDIO-RELIABILITY',area='Audio reliability',requirement=title,requirement_status='Implemented',priority='P1',test_type='unit + browser + regression',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='v0.8.23.2 audio module and browser Web Audio',steps=steps,expected_result=expected,related_automated_scripts='v08232_audio_reliability.mjs;v08232_audio_storage_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Browser persistence uses simulated storage; Chromium navigation blocked by sandbox admin. Actual localStorage origin/Safari/speaker quality remains unverified.'))
assert len(rows)==383,len(rows)
assert len({r['test_id'] for r in rows})==383
with p.open('w',newline='') as f:
 w=csv.DictWriter(f,header);w.writeheader();w.writerows(rows)
q=root/'docs/MASTER_QA_CATALOG_SUMMARY_v08221.json';summary=json.loads(q.read_text())
summary.update(total=383,total_cases=383,crosscutting=87,audio_reliability_v08232=8)
summary['by_area']=dict(collections.Counter(r['area'] for r in rows))
summary['by_execution']=dict(collections.Counter(r['execution_status'] for r in rows))
summary['note_v08232']='Eight audio reliability acceptance cases added. Per-script regression PASS is not proof of each individual catalog case. Storage simulated: real-origin navigation was blocked.'
q.write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n')
print('Catalog: ',len(rows),'cases; no claim of individual-case certification.')
