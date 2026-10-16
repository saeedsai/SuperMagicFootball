#!/usr/bin/env python3
"""Validate long-horizon concept graphics plan and tracker; never mutate game data."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs'/'concept_character_pipeline'
data=json.loads((DOC/'PROGRESS_TRACKER.json').read_text(encoding='utf8'))
required=('README.md','MASTER_ROADMAP.md','ASSET_RIG_AND_RENDERING_SPEC.md',
          'CUSTOMIZATION_AND_MODEL_CATALOG.md','ANIMATION_SPEC.md',
          'TEST_AND_RELEASE_PLAN.md','NEXT_CHAT_HANDOVER.md')
assert data['schema']=='smf-concept-modular-roadmap/1'
assert data['branch']=='dev'
assert len(data['milestones'])==13
assert [x['id'] for x in data['milestones']]==[f'C{i:02}' for i in range(13)]
assert len(data['targetVariantCounts'])==17
assert set(data['targetVariantCounts'])==set(data['verifiedModularVariantCounts'])
assert all(type(v) is int and v>0 for v in data['targetVariantCounts'].values())
assert all(type(data['verifiedModularVariantCounts'][name]) is int and
           0<=data['verifiedModularVariantCounts'][name]<=target
           for name,target in data['targetVariantCounts'].items())
assert len(data['productionEightViews'])==8
assert len(set(data['productionEightViews']))==8
assert set(data['authoredViewStatus'])==set(data['productionEightViews'])
assert len(data['animationGroups'])==10
assert set(data['completedAnimationGroups'])==set(data['animationGroups'])
assert data['currentMilestone'] in {x['id'] for x in data['milestones']}
assert len(data['proposedFirstTeamSlots'])==12
roles=[x['role'] for x in data['proposedFirstTeamSlots']]
assert (roles.count('GK'),roles.count('DF'),roles.count('MF'),roles.count('FW'))==(2,3,4,3)
assert [x['slot'] for x in data['proposedFirstTeamSlots']]==list(range(1,13))
assert len({x['identifier'] for x in data['proposedFirstTeamSlots']})==12
valid={'planned','not_started','in_progress','blocked','verified','released'}
assert all(x['status'] in valid for x in data['milestones'])
assert all(x in valid for x in data['authoredViewStatus'].values())
assert all(x in valid for x in data['completedAnimationGroups'].values())
assert set(required)==set(data['documentPaths'])
for name in required:
    f=DOC/name
    assert f.is_file() and f.stat().st_size>250,(name,'missing/empty')
    text=f.read_text(encoding='utf8')
    assert text.startswith('# '),name
index=(DOC/'README.md').read_text(encoding='utf8')
for name in required[1:]:
    assert name in index,('missing index link',name)
assert 'PROGRESS_TRACKER.json' in index
assert 'PROGRESS_TRACKER.json' in (DOC/'NEXT_CHAT_HANDOVER.md').read_text(encoding='utf8')
print('CONCEPT_GRAPHICS_PLAN_PASS:',len(required),'documents,',
      len(data['milestones']),'milestones,',len(data['targetVariantCounts']),
      'customization families,',len(data['productionEightViews']),
      'true directions,',len(data['animationGroups']),'action groups')
