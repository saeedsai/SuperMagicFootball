#!/usr/bin/env python3
"""UX28 Career: opt-in starting-six edits use Career roster and persist on save."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True, executable_path='/usr/bin/chromium',
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    for device, viewport, touch in [
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ]:
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.evaluate("""() => {
          const data=new Map();
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
            removeItem:k=>data.delete(k),clear:()=>data.clear()
          }});
        }""")
        page.set_content(html, wait_until='load')
        page.wait_for_function('!!window.NekketsuHD?.getCareer', timeout=60000)
        open_feature(page, 'manager')
        page.locator('[data-action="startManager"]').first.click()
        page.locator('[data-action="careerSquad"]').first.click()
        energy_slot = int(page.evaluate("""() => {
          const c=NekketsuHD.getCareer(),slot=c.teamPlan.lineup[1];
          c.roster[slot].energy=43;
          return slot;
        }"""))
        page.locator('[data-action="careerTactics"]').first.click()
        assert page.locator('.heading').inner_text() == 'TEAM COMMAND CENTER', (device, 'Career lineup editor did not open')
        assert 'current Career roster' in page.locator('.navScreen, #menu').inner_text(), (device, 'editor must identify the Career roster')
        energy_badge = page.locator('.lineupEnergy[data-lineup-energy="1"]')
        assert energy_badge.inner_text() == 'ENERGY 43%', (device, 'selected formation slot must show saved Career Energy', energy_badge.inner_text())
        assert page.locator('[data-lineup-ovr="1"]').get_attribute('aria-label').endswith('Energy 43 percent'), (device, 'Energy must be in the starter rating accessible name')
        assert page.locator('.rosterCard').nth(1).inner_text().find('ENERGY') >= 0, (device, 'starter and bench cards must expose Energy')
        assert page.locator('.formationEnergy').count() == 6, (device, 'all formation positions must show Energy')

        candidate = page.evaluate("""() => {
          const c=NekketsuHD.getCareer(),plan=c.teamPlan;
          const starters=new Set(plan.lineup),slot=1,starter=c.roster[plan.lineup[slot]];
          const reserve=c.roster.findIndex((p,i)=>!starters.has(i)&&p.role===starter.role);
          if(reserve<0)throw Error('Career roster has no same-role bench player');
          return {club:c.club,slot,reserve,role:starter.role,
            roster:JSON.stringify(c.roster),career:JSON.stringify(c),plan,stored:localStorage.getItem('legend_teamPlans')};
        }""")
        page.locator('#pos1').select_option(str(candidate['reserve']))
        preview = page.evaluate("""() => ({
          career:JSON.stringify(NekketsuHD.getCareer()),
          stored:localStorage.getItem('legend_teamPlans')
        })""")
        assert preview['career'] == candidate['career'], (device, 'preview mutated Career save')
        assert preview['stored'] == candidate['stored'], (device, 'preview saved before explicit approval')

        page.locator('[data-action="saveSquad"]').click()
        assert page.locator('.heading').inner_text() == 'MANAGER SQUAD', (device, 'save did not return to Career squad')
        saved_plan = page.evaluate('NekketsuHD.getCareer().teamPlan')
        assert saved_plan['lineup'][candidate['slot']] == candidate['reserve'], (device, 'approved replacement was not persisted')
        assert page.evaluate('JSON.stringify(NekketsuHD.getCareer().roster)') == candidate['roster'], (device, 'lineup edit changed the Career roster')
        assert page.evaluate("localStorage.getItem('legend_teamPlans')") == candidate['stored'], (device, 'Career tactics overwrote the shared non-Career plan map')

        # Copy the Career into another slot, give the copy different tactics,
        # then switch back and verify the original plan remains isolated.
        page.locator('[data-action="manager"]').first.click()
        page.locator('[data-action="navCareer"]').first.click()
        page.locator('[data-action="navCareerSlots"]').first.click()
        page.locator('[data-action="careerSlotCopy_1"]').click()
        page.locator('[data-action="careerSlotLoad_2"]').click()
        assert page.locator('.heading').inner_text() == 'MANAGER CAREER', (device, 'copy load did not activate slot 2')
        copied = page.evaluate('NekketsuHD.getCareer()')
        assert copied['teamPlan']['lineup'][candidate['slot']] == candidate['reserve'], (device, 'copy lost its slot plan')
        assert page.evaluate('JSON.stringify(NekketsuHD.getCareer().roster)') == candidate['roster'], (device, 'slot copy changed Career roster')

        page.locator('[data-action="careerSquad"]').first.click()
        page.locator('[data-action="careerTactics"]').click()
        page.locator('#attackStyle').select_option('Direct')
        page.locator('[data-action="saveSquad"]').click()
        assert page.evaluate('NekketsuHD.getCareer().teamPlan.attack') == 'Direct', (device, 'slot 2 plan edit was not saved')
        assert page.evaluate("localStorage.getItem('legend_teamPlans')") == candidate['stored'], (device, 'slot 2 tactics changed shared team plan map')

        page.locator('[data-action="manager"]').first.click()
        page.locator('[data-action="navCareer"]').first.click()
        page.locator('[data-action="navCareerSlots"]').first.click()
        page.locator('[data-action="careerSlotLoad_1"]').click()
        original = page.evaluate('NekketsuHD.getCareer()')
        slot_one_plan = original['teamPlan']
        assert original['teamPlan']['attack'] == candidate['plan']['attack'], (device, 'slot 1 tactics were overwritten by slot 2')
        assert original['teamPlan']['lineup'][candidate['slot']] == candidate['reserve'], (device, 'slot 1 lineup was overwritten by slot 2')
        assert page.evaluate('JSON.stringify(NekketsuHD.getCareer().roster)') == candidate['roster'], (device, 'slot switch changed Career roster')

        # A failed active-slot write must leave memory, storage and global plans unchanged.
        slots_before = page.evaluate("localStorage.getItem('legend_careerSlots')")
        page.locator('[data-action="careerSquad"]').first.click()
        page.locator('[data-action="careerTactics"]').click()
        page.locator('#attackStyle').select_option('Possession')
        page.evaluate("""() => {
          const storage=window.localStorage,original=storage.setItem.bind(storage);let fail=true;
          Object.defineProperty(storage,'setItem',{configurable:true,value:(key,value)=>{
            if(key==='legend_careerSlots'&&fail){fail=false;throw new DOMException('simulated quota','QuotaExceededError')}
            return original(key,value);
          }});
        }""")
        page.locator('[data-action="saveSquad"]').click()
        assert page.locator('.heading').inner_text() == 'TEAM COMMAND CENTER', (device, 'failed save should leave editor open')
        assert page.evaluate('NekketsuHD.getCareer().teamPlan') == slot_one_plan, (device, 'failed save mutated in-memory Career plan')
        assert page.evaluate("localStorage.getItem('legend_careerSlots')") == slots_before, (device, 'failed save changed Career slots')
        assert page.evaluate("localStorage.getItem('legend_teamPlans')") == candidate['stored'], (device, 'failed save changed global team plans')

        page.locator('[data-action="careerSquad"]').first.click()
        page.locator('[data-action="manager"]').first.click()
        page.locator('[data-action="careerPlay"]').first.click()
        live = page.evaluate("""() => ({
          mode:NekketsuHD.game.mode,
          lineup:NekketsuHD.game.lineups[0],
          roster:NekketsuHD.game.rosters[0].map(p=>p.id)
        })""")
        assert live['mode'] == 'career', (device, live)
        assert live['lineup'][candidate['slot']] == candidate['reserve'], (device, 'Career kickoff ignored saved plan')
        assert len(live['roster']) == 12, (device, 'Career roster size changed')
        assert not errors, (device, errors)
        print('CAREER_LINEUP_EDITOR_BROWSER_PASS', device,
              'explicit save, Career-roster identity, stored plan used at kickoff', flush=True)
        context.close()
    browser.close()
