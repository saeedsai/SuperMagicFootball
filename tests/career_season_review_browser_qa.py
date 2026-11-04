"""UX28 Career season review: read-only preview and explicit rollover on desktop/touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / 'tests/.generated/play.html'
if not HTML_PATH.exists():
    raise SystemExit('Run py -3.12 -X utf8 scripts/build.py before Career season review browser QA')
HTML = HTML_PATH.read_text(encoding='utf8')

STORAGE_FIXTURE = r"""
(() => {
  const data = new Map(), writes = [];
  window.__careerReviewStorage = {data, writes};
  Object.defineProperty(window, 'localStorage', {configurable:true, value:{
    getItem:key => data.has(key) ? data.get(key) : null,
    setItem:(key,value) => { writes.push([key,String(value)]); data.set(key,String(value)); },
    removeItem:key => { writes.push([key,null]); data.delete(key); },
    clear:() => data.clear(),
  }});
})();
"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for device, viewport, touch in (
        ('desktop', {'width': 1360, 'height': 800}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ):
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        context.add_init_script(STORAGE_FIXTURE)
        page = context.new_page()
        errors, dialogs = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.dismiss()))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.NekketsuHD?.getCareer', timeout=60000)

        def click(action):
            page.locator('[data-action="' + action + '"]').first.click(timeout=30000)

        # Start an ordinary Career to exercise the real save-slot and roster paths.
        click('navCareer')
        click('manager')
        click('startManager')
        page.wait_for_function('!!window.NekketsuHD.getCareer()', timeout=10000)

        page.evaluate("""() => {
          const c = NekketsuHD.getCareer();
          c.leagueFinished = true;
          c.week = c.fixtures.length;
          c.table = Object.fromEntries(c.members.map((id,i) => [id, i === 0
            ? {p:14,w:12,d:1,l:1,gf:29,ga:9,pts:37}
            : {p:14,w:9,d:2,l:3,gf:23-i,ga:15,pts:29-i} ]));
          c.cup = {stage:2,eliminated:false,pending:false,wins:2};
          window.__careerReviewStorage.writes.length = 0;
        }""")
        before = page.evaluate("""() => ({
          career:JSON.stringify(NekketsuHD.getCareer()),
          vault:localStorage.getItem('legend_careerSlots'),
          legacy:localStorage.getItem('legend_managerCareer'),
          writes:window.__careerReviewStorage.writes.length,
          season:NekketsuHD.getCareer().season,
          clubName:NekketsuHD.teams[NekketsuHD.getCareer().club].name
        })""")

        # Force the Manager screen to re-read the finished in-memory season.
        click('careerSquad')
        click('manager')
        assert page.locator('[data-action="careerSeason"]').count() == 1, (device, 'review action appears for completed season')
        click('careerSeason')
        assert page.locator('.heading').inner_text() == 'CAREER SEASON REVIEW', (device, page.locator('.heading').inner_text(), page.locator('#menu').inner_text(), errors)
        review = page.locator('#careerSeasonReview')
        text = review.inner_text()
        assert 'FINAL LEAGUE TABLE' in text and before['clubName'] in text, (device, text)
        assert 'Career Cup in progress' in text and '2 wins' in text, (device, text)
        assert page.locator('#careerSeasonReview table tbody tr').count() == 8, (device, 'full league ranking shown')
        assert page.locator('#careerSeasonReview button, #careerSeasonReview a, #careerSeasonReview input').count() == 0, (device, 'summary itself is read-only')
        assert page.locator('[data-action="careerSeasonConfirm"]').count() == 1, (device, 'explicit next-season control')
        during = page.evaluate("""() => ({
          career:JSON.stringify(NekketsuHD.getCareer()),
          vault:localStorage.getItem('legend_careerSlots'),
          legacy:localStorage.getItem('legend_managerCareer'),
          writes:window.__careerReviewStorage.writes.length
        })""")
        assert during == {key:before[key] for key in ('career','vault','legacy','writes')}, (device, 'opening review made no changes', before, during)

        # Back is the cancellation path: no career or storage writes occur.
        click('manager')
        after_back = page.evaluate("""() => ({
          career:JSON.stringify(NekketsuHD.getCareer()),
          vault:localStorage.getItem('legend_careerSlots'),
          legacy:localStorage.getItem('legend_managerCareer'),
          writes:window.__careerReviewStorage.writes.length
        })""")
        assert after_back == during, (device, 'Back cancels without changing the completed season', during, after_back)

        # Reopen, then explicitly approve rollover. Existing nextSeason and saveCareer semantics own all writes.
        click('careerSeason')
        click('careerSeasonConfirm')
        rolled = page.evaluate("""() => {
          const c=NekketsuHD.getCareer(),v=JSON.parse(localStorage.getItem('legend_careerSlots'));
          return {season:c.season,week:c.week,leagueFinished:c.leagueFinished,
            table:Object.values(c.table).every(r=>r.p===0&&r.w===0&&r.d===0&&r.l===0&&r.gf===0&&r.ga===0&&r.pts===0),
            cup:JSON.stringify(c.cup),vaultActive:v.active,vaultSeason:v.slots[v.active-1].career.season,
            legacySeason:JSON.parse(localStorage.getItem('legend_managerCareer')).season,
            writeKeys:window.__careerReviewStorage.writes.map(w=>w[0])};
        }""")
        assert rolled['season'] == before['season'] + 1 and rolled['week'] == 0 and rolled['leagueFinished'] is False, (device, rolled)
        assert rolled['table'] and rolled['cup'] == '{"stage":0,"eliminated":false,"pending":false,"wins":0}', (device, rolled)
        assert rolled['vaultActive'] == 1 and rolled['vaultSeason'] == rolled['season'] and rolled['legacySeason'] == rolled['season'], (device, rolled)
        assert rolled['writeKeys'].count('legend_careerSlots') == 1 and rolled['writeKeys'].count('legend_managerCareer') == 1, (device, rolled['writeKeys'])

        # A no-fixture legacy/malformed season cannot display an approval control or roll forward.
        page.evaluate("""() => { const c=NekketsuHD.getCareer(); c.fixtures=[]; c.week=0; c.leagueFinished=false; window.__careerReviewStorage.writes.length=0; }""")
        click('careerSquad')
        click('manager')
        click('careerSeason')
        assert page.locator('.heading').inner_text() == 'SEASON REVIEW UNAVAILABLE', (device, page.locator('.heading').inner_text())
        assert page.locator('[data-action="careerSeasonConfirm"]').count() == 0, (device, 'malformed legacy season fails closed')
        assert page.evaluate('window.__careerReviewStorage.writes.length') == 0, (device, 'unavailable season did not save')
        assert not dialogs and not errors, (device, dialogs, errors)
        print('CAREER_SEASON_REVIEW_BROWSER_PASS', device, 'read-only preview, Back cancellation, explicit rollover, slot/mirror persistence, malformed season gate', flush=True)
        context.close()
    browser.close()
