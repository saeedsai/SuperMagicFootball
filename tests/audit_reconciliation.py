from pathlib import Path
import csv,collections,json,datetime
root=Path(__file__).resolve().parents[1]
base=Path('/mnt/data')
docs=root/'docs'
def load(filename):
 with (base/filename).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
a=load('Supermagic_2026_Audit_Faults_and_Gaps.csv')
m=load('Supermagic_2026_Missing_Players_To_Add.csv')
v=load('Supermagic_2026_Named_Players_Verification_and_Correction.csv')
ac=collections.Counter(x['issue_type'] for x in a)
sev=collections.Counter(x['severity'] for x in a)
fix=[]
for x in v:
 if x['position_correction']=='change' and x['verified_position']:
  fix.append(dict(priority='P0',category='position_review',team=x['team_name'],player=x['player_name'],player_id=x['player_id'],existing=x['existing_position'],proposed=x['verified_position'],source=x['source_for_position'],approval='needs_human_verification',notes='Verify date of source and broad-role mapping before applying; check GK/DF/MF/FW lineup impact.'))
 if x['overall_alignment_needed']=='different':
  fix.append(dict(priority='P2',category='rating_alignment_review',team=x['team_name'],player=x['player_name'],player_id=x['player_id'],existing=x['existing_ea_comparable_overall'],proposed=x['ea_fc27_overall'],source=x['source_for_rating'],approval='needs_human_verification',notes='Keep EA reference separated from balanced game rating; licensing/reference date review.'))
 if x['value_alignment_needed']=='different':
  fix.append(dict(priority='P1',category='market_value_review',team=x['team_name'],player=x['player_name'],player_id=x['player_id'],existing=x['existing_game_transfer_value'],proposed=x['transfermarkt_value_eur'],source=x['source_for_value_height'],approval='needs_human_verification',notes='EUR market valuation must not overwrite arcade transfer-economy value.'))
for x in m:
 fix.append(dict(priority='P0' if x['priority']=='critical' else 'P2',category='candidate_to_add',team=x['team_name'],player=x['missing_player_name'],player_id='',existing='not in roster',proposed=x['suggested_position'],source=x['source_url'],approval='needs_human_verification',notes=f'Available academy slots: {x["placeholder_slots_available"]}; 12 player slots max, verify membership and select best candidates.'))
for issue,category,priority in [('SAME_PLAYER_AGE_CONFLICT','identity_age_consistency','P1'),('SAME_PLAYER_OVR_SPREAD_GE8','cross_team_overall_consistency','P1'),('NOT_ON_CURRENT_CLUB_SOURCE','club_membership_review','P0')]:
 for x in a:
  if x['issue_type']!=issue:continue
  fix.append(dict(priority=priority,category=category,team=x['team_name'],player=x['player_name'],player_id=x['player_id'],existing=x['current_value'],proposed=x['reference_value'],source=x['source_url'],approval='needs_human_verification',notes=x['suggested_fix']))
queue=docs/'ROSTER_RECONCILIATION_QUEUE_v089.csv'
with queue.open('w',encoding='utf-8',newline='') as f:
 w=csv.DictWriter(f,fieldnames=['priority','category','team','player','player_id','existing','proposed','source','approval','notes']);w.writeheader();w.writerows(fix)
summary={
 'audit_fault_rows':len(a),'audit_unique_teams':len(set(x['team_name'] for x in a)),
 'issue_types':dict(ac),'severities':dict(sev),
 'named_verification_rows':len(v),'position_change_proposals':sum(x['position_correction']=='change' for x in v),
 'positions_with_source':sum(bool(x['source_for_position']) for x in v if x['position_correction']=='change'),
 'market_value_alignment_flags':sum(x['value_alignment_needed']=='different' for x in v),
 'overall_alignment_flags':sum(x['overall_alignment_needed']=='different' for x in v),
 'missing_player_candidates':len(m),'missing_candidate_teams':len(set(x['team_name'] for x in m)),
 'critical_missing_candidates':sum(x['priority']=='critical' for x in m),
 'staged_review_queue':len(fix),'queue_categories':dict(collections.Counter(x['category'] for x in fix)),
 'game_data_modified_from_audit':False,'audit_run_as_of':'2026-10-13'}
(docs/'AUDIT_CSV_SUMMARY_v089.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False))
assert len(a)==9736 and len(m)==296 and len(v)==806
assert len(fix)==sum(summary['queue_categories'].values())
print(json.dumps(summary,indent=2))
