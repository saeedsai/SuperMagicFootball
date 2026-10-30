#!/usr/bin/env python3
"""STUDIO-101: real modular Player Studio stat editing, desktop and simulated touch."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Run python3 scripts/build.py before browser QA'
html = fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for label, viewport, touch in (
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ):
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.evaluate("""() => {
          const data = new Map();
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:k=>data.has(k)?data.get(k):null,
            setItem:(k,v)=>data.set(k,String(v)),
            removeItem:k=>data.delete(k),
            clear:()=>data.clear()
          }});
        }""")
        page.set_content(html, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        for action in ('navSettings', 'navCustomization', 'playerStudio'):
            page.locator('[data-action="' + action + '"]').first.click()

        assert page.locator('#studioStatsEditor').count() == 1, (label, 'stats editor missing')
        page.locator('#studioStatsEditor summary').click()
        fields = page.locator('#studioStatsEditor input[type=number]')
        assert fields.count() == 15, (label, 'expected fifteen independent stats including Jumping')
        assert page.locator('#touchButtons [data-act]').count() == 4
        # STUDIO-JUMP-PREVIEW-01: verify live, unsaved Jumping feedback in both layouts.
        jumping = page.locator('#stat_jumping')
        assert jumping.count() == 1, (label, 'Jumping input missing')
        old_jump = jumping.input_value()
        preview = page.locator('#studioJumpPreview')
        before_jump = preview.inner_text()
        assert 'JUMPING' in before_jump and 'LEAP HEIGHT' in before_jump and 'ENERGY COST' in before_jump
        new_jump = int(old_jump) - 1 if int(old_jump) > 1 else int(old_jump) + 1
        jumping.fill(str(new_jump))
        after_jump = preview.inner_text()
        assert after_jump != before_jump and f'JUMPING {new_jump}/100' in after_jump, (label, before_jump, after_jump)
        jumping.fill(old_jump)
        assert preview.inner_text() == before_jump, (label, 'unsaved Jumping reset did not restore preview')

        before = page.evaluate("localStorage.getItem('legend_edits')")
        assert before is None, (label, 'unexpected preexisting team edits')
        value = page.locator('#stat_gkDiving')
        baseline = int(value.input_value())
        changed = baseline - 4 if baseline >= 96 else baseline + 4
        value.fill('0')
        page.once('dialog', lambda dialog: dialog.accept())
        page.locator('[data-action="saveStudioStats"]').click()
        assert page.evaluate("localStorage.getItem('legend_edits')") is None, (
            label, 'invalid numeric stat must not be persisted'
        )
        value.fill(str(changed))
        ovr = page.locator('#studioStatOVR').inner_text()
        assert ovr.startswith('POSITION OVR: ') and 'Invalid' not in ovr, (label, ovr)
        page.locator('[data-action="saveStudioStats"]').click()
        saved = page.evaluate("""() => {
          const all=JSON.parse(localStorage.getItem('legend_edits'));
          const key=Object.keys(all)[0];
          return {key,roster:all[key]};
        }""")
        assert len(saved['roster']) == 12, (label, 'team roster shape changed')
        assert saved['roster'][0]['gkDiving'] == changed, (label, 'stat not persisted')
        assert saved['roster'][0].get('id'), (label, 'player identity lost')
        page.locator('#studioStatsEditor summary').click()
        assert int(page.locator('#stat_gkDiving').input_value()) == changed, (
            label, 'Player Studio failed to reopen saved stat'
        )
        assert not errors, (label, errors)
        print('STUDIO_STATS_BROWSER_PASS', label,
              '15 stats, live Jumping preview, validation, overall, durable save and reload', flush=True)
        context.close()
    browser.close()
