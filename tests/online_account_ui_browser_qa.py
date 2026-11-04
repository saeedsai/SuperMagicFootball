#!/usr/bin/env python3
"""Focused account-route browser QA; uses mocked OIDC/API and local Career saves only."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit
import json, shutil, socket, ssl, subprocess, tempfile, threading, time

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'index.html'
assert FIXTURE.exists(), 'Run python scripts/build.py before this browser QA.'
terminal_snapshot_js = "import {createOnlineGameEngine} from './scripts/online-game-engine.mjs'; const engine=await createOnlineGameEngine({home:0,away:9,halfSeconds:60,seed:7}); const s=structuredClone(engine.snapshot); s.tick=10;s.phase='finished';s.matchState='finished';s.terminal=true;s.half=2;s.score=[2,0];s.teamIds=['brazil','japan'];console.log(JSON.stringify(s));"
terminal_snapshot = json.loads(subprocess.run(['node','--input-type=module','-e',terminal_snapshot_js],cwd=ROOT,check=True,capture_output=True,text=True).stdout)


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, _request, _client_address):
        pass


def wait_ready(url, server):
    import urllib.request
    until = time.monotonic() + 20
    while time.monotonic() < until:
        try:
            with urllib.request.urlopen(url, context=ssl._create_unverified_context(), timeout=1) as response:
                if response.status == 200:
                    return
        except Exception:
            if not server.is_alive():
                break
            time.sleep(.1)
    raise TimeoutError('local HTTPS game server did not become ready')


port = free_port()
origin = f'https://localhost:{port}'
redirect_uri = f'{origin}/index.html'
with tempfile.TemporaryDirectory(prefix='smf-online-ui-') as temp:
    cert = Path(temp) / 'cert.pem'
    key = Path(temp) / 'key.pem'
    openssl = shutil.which('openssl')
    if openssl:
        subprocess.run([openssl, 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', str(key), '-out', str(cert), '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        raise RuntimeError('OpenSSL is required to make the local HTTPS origin used for PKCE browser QA.')

    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
    httpd = QuietServer(('127.0.0.1', port), handler)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=cert, keyfile=key)
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    server = threading.Thread(target=httpd.serve_forever, daemon=True)
    server.start()
    wait_ready(origin + '/tests/.generated/play.html', server)

    members = list(range(8))
    rounds = []
    rotation = members[:]
    for _ in range(len(rotation) - 1):
        rounds.append([[rotation[i], rotation[len(rotation) - 1 - i]] for i in range(len(rotation) // 2)])
        rotation = [rotation[0], rotation[-1], *rotation[1:-1]]
    fixtures = rounds + [[[away, home] for home, away in matchday] for matchday in rounds]
    career = {
        'club': 0, 'season': 1, 'week': 0, 'members': members, 'fixtures': fixtures, 'history': [],
        'roster': [{'id': f'fixture-player-{i}', 'role':(['GK','DF','DF','MF','FW','FW'][i] if i<6 else 'MF')} for i in range(12)],
        'table': {str(i): {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0} for i in members},
        'facilities': {'training': 1}, 'cup': {'stage': 0}, 'cash': 100,
    }
    slot = {'name': 'Local QA Career', 'savedAt': '2026-11-04T12:00:00.000Z', 'career': career}
    seeded_vault = {'schema': 1, 'active': 1, 'slots': [slot] + [None] * 9}
    seed_storage = {'legend_careerSlots': json.dumps(seeded_vault), 'legend_managerCareer': json.dumps(career)}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        # Unconfigured account routes stay explicit and do not interfere with offline Career.
        context_plain = browser.new_context(viewport={'width': 1280, 'height': 800}, ignore_https_errors=True, service_workers='block')
        page = context_plain.new_page()
        errors = []
        console_errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
        page.add_init_script('window.localStorage.setItem("legend_careerSlots", '+json.dumps(seed_storage['legend_careerSlots'])+'); window.localStorage.setItem("legend_managerCareer", '+json.dumps(seed_storage['legend_managerCareer'])+');')
        page.goto(redirect_uri, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_function("document.querySelector('[data-action=navOnline]') || document.querySelector('#retryLoad')", timeout=30000)
        if page.locator('#retryLoad').count():
            print('ONLINE_UI_BOOT_DIAGNOSTIC', ascii(page.locator('#menu').inner_text()), errors, console_errors, flush=True)
            raise RuntimeError('game modules failed before account UI boot')
        page.locator('[data-action="navOnline"]').last.click()
        page.locator('[data-action="navOnlineServerMatch"]').click()
        assert page.locator('text=ONLINE ACCOUNT NOT CONFIGURED').count() == 1
        assert page.locator('#onlineMatchStatus').get_attribute('role') == 'status'
        page.locator('[data-action="navOnline"]').click()
        page.locator('[data-action="navOnlineCareer"]').click()
        assert page.locator('text=ONLINE ACCOUNT NOT CONFIGURED').count() == 1
        assert page.locator('text=Offline Career, saves, teams and matches remain available').count() == 1
        page.locator('[data-action="navOnline"]').click()
        page.locator('[data-action="navOnlineUltimate"]').click()
        assert page.locator('text=ONLINE ACCOUNT NOT CONFIGURED').count() == 1
        page.locator('[data-action="navOnline"]').click()
        page.locator('[data-action="home"]').click()
        page.locator('[data-action="navCareer"]').click()
        assert page.locator('[data-action="navCareerSlots"]').count() == 1
        assert page.locator('[data-action="manager"]').count() >= 1
        assert not errors, errors
        context_plain.close()

        # Configured OIDC and account API are mocked at the network boundary; PKCE remains real.
        context_auth = browser.new_context(viewport={'width': 1280, 'height': 800}, ignore_https_errors=True, service_workers='block')
        page = context_auth.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script('window.localStorage.setItem("legend_careerSlots", '+json.dumps(seed_storage['legend_careerSlots'])+'); window.localStorage.setItem("legend_managerCareer", '+json.dumps(seed_storage['legend_managerCareer'])+');')
        archived_career={'seasonId':'d'*32,'season':{'version':2,'status':'complete','fixtureCount':1,'playedCount':1,'teamId':'japan','fixtures':[{'fixtureNo':1,'status':'completed','teamIds':['japan','brazil'],'score':[2,0],'recordedAt':'2026-11-01T12:00:00.000Z'}],'standings':[{'teamId':'japan','played':1,'wins':1,'draws':0,'losses':0,'goalsFor':2,'goalsAgainst':0,'points':3,'goalDifference':2},{'teamId':'brazil','played':1,'wins':0,'draws':0,'losses':1,'goalsFor':0,'goalsAgainst':2,'points':0,'goalDifference':-2}]}}
        api = {'career': None, 'squad': None, 'onlineCareerSeason':None, 'onlineCareerArchive':[archived_career], 'onlineCareerTicketRequests':0, 'conflict': False, 'puts': [], 'ticketRequests': 0, 'resumeTicketRequests':0, 'ticketBodies': [], 'rewardClaims': [], 'historyRequests':0, 'utBalance':800, 'utOwned':[{'category':'team','itemId':'japan','acquiredAt':None}]+[{'category':'player','itemId':f'japan/jp{i}','acquiredAt':None} for i in range(12)], 'utPurchases':[], 'utReceipts':{}, 'utCollectionFailures':0, 'utLosePurchaseResponse':True, 'utLineups':{'japan':{'teamId':'japan','playerIds':[f'japan/jp{i}' for i in range(12)],'version':0}}, 'utLineupReceipts':{}, 'utLineupRequests':[], 'utLineupLoseResponse':True}
        online_inputs = []
        online_ws = {'socket':None}

        def configured_js(route):
            cfg = {'apiOrigin': origin, 'issuer': 'https://issuer.test/', 'clientId': 'public-client-id', 'audience': 'https://api.example.test', 'redirectUri': redirect_uri}
            route.fulfill(status=200, content_type='application/javascript', body='window.SMF_ONLINE_CONFIG=Object.freeze('+json.dumps(cfg)+');')

        def issuer_route(route):
            url = route.request.url
            if url.endswith('/.well-known/openid-configuration'):
                route.fulfill(json={'issuer':'https://issuer.test/','authorization_endpoint':'https://issuer.test/authorize','token_endpoint':'https://issuer.test/token','code_challenge_methods_supported':['S256']})
            elif url.endswith('/token'):
                route.fulfill(json={'access_token':'browser-test-access-token-0123456789','token_type':'Bearer','expires_in':3600})
            elif '/authorize?' in url:
                query = parse_qs(urlsplit(url).query)
                callback = query['redirect_uri'][0] + '?' + urlencode({'code':'browser-code','state':query['state'][0]})
                route.fulfill(status=302, headers={'location':callback})
            else:
                route.fulfill(status=404, json={'error':'not-found'})

        def api_route(route):
            req = route.request
            path = urlsplit(req.url).path
            assert req.headers.get('authorization') == 'Bearer browser-test-access-token-0123456789'
            if path.endswith('/online-career/current') and req.method == 'GET':
                route.fulfill(json={'season':api['onlineCareerSeason']})
            elif path.endswith('/online-career/seasons') and req.method == 'GET':
                route.fulfill(json={'seasons':api['onlineCareerArchive']})
            elif path.endswith('/online-career/current') and req.method == 'POST':
                data=req.post_data_json or {}
                assert set(data) in (set(),{'teamId'}) and 'accountId' not in data
                team_id=data.get('teamId','japan')
                opponents=[team for team in ['brazil','france','germany','spain','italy','england','canada','mexico','argentina'] if team!=team_id][:8]
                api['onlineCareerSeason']={'version':1,'status':'active','fixtureCount':8,'playedCount':0,'teamId':team_id,
                    'fixtures':[{'fixtureNo':i+1,'status':'scheduled','teamIds':[team_id,opponents[i]],'score':None,'recordedAt':None} for i in range(8)],'standings':[]}
                route.fulfill(status=200,json={'season':api['onlineCareerSeason']})
            elif path.endswith('/online-career/current/fixtures/next/ticket') and req.method == 'POST':
                assert not req.post_data
                api['onlineCareerTicketRequests']+=1
                season=api['onlineCareerSeason'];next_fixture=next(row for row in season['fixtures'] if row['status']=='scheduled')
                route.fulfill(status=201,json={'ticket':'c'*64,'expiresAt':int(time.time()*1000)+30000,'fixtureNo':next_fixture['fixtureNo'],'teamIds':next_fixture['teamIds']})
            elif path.endswith('/matches/ticket') and req.method == 'POST':
                api['ticketRequests'] += 1
                api['ticketBodies'].append(req.post_data_json if req.post_data else None)
                route.fulfill(json={'ticket':'a'*64,'expiresAt':int(time.time()*1000)+30000})
            elif path.endswith('/matches/resume-ticket') and req.method == 'POST':
                assert not req.post_data and not parse_qs(urlsplit(req.url).query)
                api['resumeTicketRequests']+=1
                route.fulfill(status=201,json={'ticket':'e'*64,'expiresAt':int(time.time()*1000)+15000})
            elif path.endswith('/matches/rewards/claim') and req.method == 'POST':
                body=req.post_data_json
                api['rewardClaims'].append(body)
                route.fulfill(status=201,json={'duplicate':False,'balance':30,'maxBalance':999999,'receipt':{'matchId':body['matchId'],'side':0,'outcome':'win','reward':30,'balanceAfter':30,'recordedAt':'2026-11-04T12:00:00.000Z'}})
            elif path.endswith('/tokens/balance') and req.method == 'GET':
                route.fulfill(json={'balance':30,'maxBalance':999999})
            elif path.endswith('/matches/history') and req.method == 'GET':
                api['historyRequests']+=1
                route.fulfill(json={'items':[{'matchId':'a'*32,'recordedAt':'2026-11-04T12:00:00.000Z','teamId':'japan','opponentTeamId':'brazil','score':[2,1],'outcome':'win'}],'nextCursor':None})
            elif path.endswith('/me'):
                route.fulfill(json={'profile':None,'version':0,'updatedAt':None})
            elif path.endswith('/career/current') and req.method == 'GET':
                body = None if api['career'] is None else {'kind':'career','payload':api['career'],'version':api['careerVersion'],'updatedAt':'2026-11-04T12:30:00.000Z'}
                route.fulfill(json={'record':body})
            elif path.endswith('/career/current') and req.method == 'PUT':
                data = req.post_data_json
                api['puts'].append(data)
                if api['conflict']:
                    api['conflict'] = False
                    route.fulfill(status=409,json={'error':'version-conflict'})
                else:
                    api['career'], api['careerVersion'] = data['snapshot'], data['expectedVersion'] + 1
                    route.fulfill(json={'status':'saved','version':api['careerVersion'],'record':{'kind':'career','payload':api['career'],'version':api['careerVersion'],'updatedAt':'2026-11-04T12:30:00.000Z'}})
            elif path.endswith('/ultimate-team/squad') and req.method == 'GET':
                body = None if api['squad'] is None else {'kind':'ultimate-team','payload':api['squad'],'version':api['squadVersion'],'updatedAt':'2026-11-04T12:30:00.000Z'}
                route.fulfill(json={'record':body})
            elif path.endswith('/ultimate-team/squad') and req.method == 'PUT':
                data = req.post_data_json
                api['puts'].append(data)
                if api['conflict']:
                    api['conflict'] = False
                    route.fulfill(status=409,json={'error':'version-conflict'})
                else:
                    api['squad'], api['squadVersion'] = data['snapshot'], data['expectedVersion'] + 1
                    route.fulfill(json={'status':'saved','version':api['squadVersion'],'record':{'kind':'ultimate-team','payload':api['squad'],'version':api['squadVersion'],'updatedAt':'2026-11-04T12:30:00.000Z'}})
            elif path.endswith('/ultimate-team/catalog') and req.method == 'GET':
                route.fulfill(json={'catalog':[{'category':'team','id':'brazil','price':300},{'category':'player','id':'brazil/brazil_4','price':250}]})
            elif path.endswith('/ultimate-team/collection') and req.method == 'GET':
                if api['utCollectionFailures']:
                    api['utCollectionFailures']-=1
                    route.fulfill(status=503,json={'error':'service-unavailable'})
                    return
                route.fulfill(json={'items':api['utOwned'],'balance':api['utBalance']})
            elif path.endswith('/ultimate-team/lineup') and req.method == 'GET':
                team_id=parse_qs(urlsplit(req.url).query).get('teamId',['japan'])[0]
                lineup=api['utLineups'].get(team_id)
                if lineup is None:
                    route.fulfill(status=404,json={'error':'team-not-owned'})
                else:
                    route.fulfill(json={'lineup':lineup})
            elif path.endswith('/ultimate-team/lineup') and req.method == 'PUT':
                data=req.post_data_json
                api['utLineupRequests'].append(data)
                prior=api['utLineupReceipts'].get(data['idempotencyKey'])
                if prior:
                    route.fulfill(status=200,json={'status':'duplicate','lineup':prior})
                    return
                current=api['utLineups'].get(data['teamId'])
                assert current is not None and data['expectedVersion']==current['version']
                lineup={'teamId':data['teamId'],'playerIds':data['playerIds'],'version':current['version']+1}
                api['utLineups'][data['teamId']]=lineup
                api['utLineupReceipts'][data['idempotencyKey']]=lineup
                if api['utLineupLoseResponse']:
                    api['utLineupLoseResponse']=False
                    route.abort()
                else:
                    route.fulfill(status=201,json={'status':'saved','lineup':lineup})
            elif path.endswith('/ultimate-team/purchases') and req.method == 'POST':
                body=req.post_data_json
                assert set(body)=={'category','itemId','idempotencyKey'} and 'accountId' not in body and 'price' not in body
                api['utPurchases'].append(body)
                prior=api['utReceipts'].get(body['idempotencyKey'])
                if prior:
                    route.fulfill(status=200,json={'status':'duplicate','balance':api['utBalance'],'receipt':prior})
                else:
                    assert (body['category'],body['itemId']) in [('player','brazil/brazil_4'),('team','brazil')]
                    price=250 if body['category']=='player' else 300
                    api['utBalance']-=price
                    timestamp='2026-11-04T14:00:00.000Z'
                    receipt={'category':body['category'],'itemId':body['itemId'],'price':price,'balanceAfter':api['utBalance'],'recordedAt':timestamp}
                    api['utReceipts'][body['idempotencyKey']]=receipt
                    api['utOwned'].append({'category':body['category'],'itemId':body['itemId'],'acquiredAt':timestamp})
                    if body['category']=='team':
                        for player_id in ['brazil/brazil_0','brazil/brazil_1','brazil/brazil_2','brazil/brazil_4','brazil/brazil_5','brazil/brazil_7','brazil/brazil_3','brazil/brazil_6','brazil/brazil_fill_MF_1','brazil/brazil_8','brazil/brazil_9','brazil/brazil_11']:
                            if not any(row['category']=='player' and row['itemId']==player_id for row in api['utOwned']):api['utOwned'].append({'category':'player','itemId':player_id,'acquiredAt':None})
                        api['utLineups']['brazil']={'teamId':'brazil','playerIds':['brazil/brazil_0','brazil/brazil_1','brazil/brazil_2','brazil/brazil_4','brazil/brazil_5','brazil/brazil_7','brazil/brazil_3','brazil/brazil_6','brazil/brazil_fill_MF_1','brazil/brazil_8','brazil/brazil_9','brazil/brazil_11'],'version':0}
                    if api['utLosePurchaseResponse']:
                        api['utLosePurchaseResponse']=False
                        route.abort() # Commit happened; simulate a lost response so the client must retry the identical idempotency key.
                    else:
                        route.fulfill(status=201,json={'status':'purchased','balance':api['utBalance'],'receipt':receipt})
            else:
                route.fulfill(status=404,json={'error':'not-found'})

        page.route('**/online-config.js', configured_js)
        page.route('https://issuer.test/**', issuer_route)
        page.route(origin + '/api/v1/**', api_route)

        def mock_match_socket(ws):
            online_ws['socket']=ws
            ws.on_message(lambda message: online_inputs.append(json.loads(message)))
            career_mode=api['onlineCareerTicketRequests']>0
            resumed=api['resumeTicketRequests']>0 and not career_mode
            ws.send(json.dumps({'type':'matched','matchId':('2' if career_mode else '1')*32,'side':0,**({'mode':'career-ai'} if career_mode else {}),**({'resumed':True} if resumed else {})}))

        page.route_web_socket(f'wss://localhost:{port}/api/v1/matches', mock_match_socket)
        page.goto(redirect_uri, wait_until='domcontentloaded', timeout=60000)
        try:
            page.wait_for_function('Boolean(window.NekketsuHD?.game)', timeout=30000)
        except Exception:
            print('ONLINE_UI_AUTH_BOOT_DIAGNOSTIC', ascii(page.locator('#menu').inner_text()), errors, flush=True)
            raise
        page.locator('[data-action="navOnline"]').click()
        page.locator('[data-action="navOnlineCareer"]').click()
        page.locator('[data-action="onlineSignIn_career"]').click()
        page.wait_for_function("document.querySelector('.heading')?.textContent.includes('ONLINE CAREER') && document.querySelector('[data-action=onlineCareerReload]')", timeout=30000)
        assert 'Sign in' not in page.locator('[aria-label="Online account"]').inner_text()
        assert page.locator('[aria-label="Online account"] [data-action="onlineSignOut"]').count() == 1
        page.locator('[data-action="onlineCareerReload"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('No remote Career')")
        page.wait_for_function("document.querySelector('#onlineCareerSeasonStatus')?.textContent.includes('No season yet')",timeout=15000)
        assert 'PAST ONLINE SEASONS' in page.locator('[aria-label="Online Career archives"]').inner_text()
        assert 'COMPLETE' in page.locator('[aria-label="Online Career archives"] summary').inner_text()
        assert [option.get_attribute('value') for option in page.locator('#onlineCareerTeam option').all()]==['japan']
        page.locator('[data-action="onlineCareerSeasonStart"]').click()
        page.wait_for_function("document.querySelector('.fixture')?.textContent.includes('ONLINE SEASON')",timeout=15000)
        assert page.locator('[aria-label="Online Career season"]').inner_text().count('FIXTURE') >= 8
        assert page.locator('#onlineCareerSeasonStatus').get_attribute('role')=='status'
        before = page.evaluate('({bytes:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer")})')
        page.locator('[data-action="onlineCareerUpload"]').click()
        assert len(api['puts']) == 1
        assert api['puts'][0]['expectedVersion'] == 0
        assert api['puts'][0]['snapshot']['career']['roster'].__len__() == 12
        assert page.evaluate('({bytes:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer")})') == before
        page.locator('[data-action="onlineCareerReload"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('Remote Career loaded')")
        page.locator('#onlineCareerSource').select_option('1')
        page.locator('[data-action="onlineCareerReload"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('Remote Career loaded')")
        assert page.locator('#onlineCareerSource').input_value() == '1'
        page.locator('#onlineCareerTarget').select_option('2')
        page.locator('[data-action="onlineCareerReload"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('Remote Career loaded')")
        assert page.locator('#onlineCareerTarget').input_value() == '2'
        page.locator('[data-action="onlineCareerImport"]').click()
        assert page.locator('#onlineAccountStatus').inner_text().find('empty local slot 2') >= 0
        after = page.evaluate('JSON.parse(localStorage.getItem("legend_careerSlots"))')
        assert after['active'] == 1
        assert after['slots'][0] == json.loads(before['bytes'])['slots'][0]
        assert after['slots'][1]['career']['season'] == career['season']
        assert page.evaluate('localStorage.getItem("legend_managerCareer")') == before['legacy']
        page.locator('[data-action="onlineHistoryReload"]').click()
        page.wait_for_function("document.querySelector('#onlineHistoryStatus')?.textContent.includes('Loaded 1 server-recorded result')")
        assert api['historyRequests']==1
        assert 'WIN' in page.locator('[aria-label="Online match history"]').inner_text()
        assert 'Japan' in page.locator('[aria-label="Online match history"]').inner_text()

        page.locator('[data-action="navOnline"]').click()
        api['utCollectionFailures']=1
        page.locator('[data-action="navOnlineServerMatch"]').click()
        page.wait_for_function("document.querySelector('#onlineMatchOwnershipStatus')?.textContent.includes('temporarily unavailable')",timeout=15000)
        assert page.locator('.heading').inner_text()=='ONLINE MATCH'
        assert page.locator('#onlineMatchTeam').is_disabled()
        assert page.locator('[data-action="onlineMatchStart"]').is_disabled()
        assert page.locator('[data-action="onlineMatchTeamsRetry"]').count()==1
        assert api['ticketRequests']==0
        page.locator('[data-action="onlineMatchTeamsRetry"]').click()
        page.wait_for_function("document.querySelector('#onlineMatchOwnershipStatus')?.textContent.includes('Verified 1 playable teams')",timeout=15000)
        assert [option.get_attribute('value') for option in page.locator('#onlineMatchTeam option').all()]==['japan']
        assert not page.locator('#onlineMatchTeam option[value="brazil"]').count()
        assert api['ticketRequests']==0
        page.locator('[data-action="navOnline"]').click()
        page.locator('[data-action="navOnlineUltimate"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('catalog and collection loaded')",timeout=15000)
        assert page.locator('[aria-label="Online Ultimate Team collection"]').inner_text().find('800') >= 0
        assert page.locator('[aria-label="Online Ultimate Team collection"]').inner_text().find('13 ITEMS OWNED') >= 0
        page.locator('#onlineUtSearch').fill('brazil/brazil_4')
        buy=page.locator('[data-online-ut-buy="player"]').first
        assert buy.inner_text().find('250')>=0
        offline_before_ut=page.evaluate('({vault:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer"),plans:localStorage.getItem("legend_teamPlans"),edits:localStorage.getItem("legend_edits")})')
        buy.click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('could not be reached')",timeout=15000)
        retry=page.locator('[data-online-ut-buy="player"]').first
        assert retry.inner_text()=='RETRY PURCHASE'
        retry.click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('confirmed from its original receipt')",timeout=15000)
        assert len(api['utPurchases'])==2 and api['utPurchases'][0]==api['utPurchases'][1]
        assert len(api['utPurchases'][0]['idempotencyKey'])>=8
        assert api['utBalance']==550 and len(api['utOwned'])==14
        assert page.evaluate('({vault:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer"),plans:localStorage.getItem("legend_teamPlans"),edits:localStorage.getItem("legend_edits")})')==offline_before_ut
        assert page.locator('[data-online-ut-buy="player"]').first.inner_text()=='OWNED'
        page.locator('#onlineUtCategory').select_option('team')
        page.locator('#onlineUtSearch').fill('brazil')
        team_buy=page.locator('[data-online-ut-buy="team"]').first
        assert '300' in team_buy.inner_text()
        team_buy.click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('added to your online collection')",timeout=15000)
        assert api['utBalance']==250 and len(api['utOwned'])==26
        page.locator('#onlineUtLineupTeam').select_option('brazil')
        page.wait_for_function("document.querySelector('#onlineUtLineupStatus')?.textContent.includes('Lineup version 0')",timeout=15000)
        page.locator('#onlineUtLineupSlot3').select_option('brazil/brazil_4')
        page.locator('[data-action="onlineUtLineupSave"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('could not be reached')",timeout=15000)
        assert len(api['utLineupRequests'])==1
        page.locator('[data-action="onlineUtLineupSave"]').click()
        page.wait_for_function("document.querySelector('#onlineUtLineupStatus')?.textContent.includes('Lineup version 1')",timeout=15000)
        assert len(api['utLineupRequests'])==2 and api['utLineupRequests'][0]==api['utLineupRequests'][1]
        assert api['utLineups']['brazil']['playerIds'][3]=='brazil/brazil_4'
        assert page.evaluate('({vault:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer"),plans:localStorage.getItem("legend_teamPlans"),edits:localStorage.getItem("legend_edits")})')==offline_before_ut
        page.locator('[data-action="onlineUtReload"]').click()
        page.wait_for_function("document.querySelector('[aria-label=\"Online Ultimate Team snapshot\"]')?.textContent.includes('NO REMOTE SNAPSHOT')")
        page.locator('[data-action="onlineUtSave"]').click()
        assert len(api['puts']) == 2
        squad_commit = api['puts'][1]
        assert squad_commit['expectedVersion'] == 0
        assert len(squad_commit['snapshot']['playerIds']) == 12
        assert len(squad_commit['idempotencyKey']) >= 8
        api['conflict'] = True
        page.locator('[data-action="onlineUtSave"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('changed elsewhere')")
        assert page.evaluate('document.activeElement?.dataset?.action') == 'onlineUtSave'
        page.locator('[data-action="onlineUtReload"]').click()
        page.wait_for_function("document.querySelector('#onlineAccountStatus')?.textContent.includes('Remote squad loaded')")
        assert page.evaluate('document.activeElement?.dataset?.action') == 'onlineUtReload'
        assert page.locator('#onlineAccountStatus').get_attribute('role') == 'status'
        local_before_signout = page.evaluate('({vault:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer")})')
        page.locator('[data-action="onlineSignOut"]').first.click()
        assert page.locator('[data-action="onlineSignIn_ultimate"]').count() == 1
        assert page.evaluate('({vault:localStorage.getItem("legend_careerSlots"),legacy:localStorage.getItem("legend_managerCareer")})') == local_before_signout

        page.locator('[data-action="navOnline"]').click()
        page.locator('[data-action="navOnlineServerMatch"]').click()
        page.locator('[data-action="onlineSignIn_match"]').click()
        page.wait_for_function("document.querySelector('.heading')?.textContent === 'ONLINE MATCH' && document.querySelector('[data-action=onlineMatchStart]')", timeout=30000)
        page.wait_for_function("document.querySelector('#onlineMatchOwnershipStatus')?.textContent.includes('Verified 2 playable teams')",timeout=15000)
        assert {option.get_attribute('value') for option in page.locator('#onlineMatchTeam option').all()}=={'japan','brazil'}
        assert not page.locator('#onlineMatchTeam option[value="argentina"]').count()
        assert page.locator('#onlineMatchStatus').get_attribute('role') == 'status'
        page.locator('#onlineMatchTeam').select_option('brazil')
        page.locator('[data-action="onlineMatchStart"]').click()
        page.wait_for_function("document.querySelector('#menu')?.classList.contains('hidden') && window.NekketsuHD?.game.matchState === 'play'", timeout=15000)
        page.keyboard.down('ArrowRight')
        page.wait_for_timeout(700)
        page.keyboard.up('ArrowRight')
        assert api['ticketRequests'] == 1
        assert api['ticketBodies'] == [{'teamId':'brazil'}]
        assert online_inputs and all(packet['type'] == 'input' and 'userId' not in packet and set(packet['input']['buttons']) == {'pass','shoot','dribble','jump'} for packet in online_inputs)
        page.keyboard.press('Escape')
        assert page.locator('[data-action="onlineMatchResume"]').count() == 1
        online_ws['socket'].close(code=1011,reason='simulated network interruption')
        page.wait_for_function("document.querySelector('#onlineMatchStatus')?.textContent.includes('Connection lost')",timeout=10000)
        assert page.locator('[data-action="onlineMatchReconnect"]').count()==1
        assert page.locator('[data-action="onlineMatchLeave"]').count()==1
        page.locator('[data-action="onlineMatchReconnect"]').click()
        page.wait_for_function("document.querySelector('#menu')?.classList.contains('hidden') && window.NekketsuHD?.game.matchState === 'play'",timeout=10000)
        assert api['resumeTicketRequests']==1 and api['ticketRequests']==1
        assert page.locator('[data-action="onlineMatchStart"]').count()==0
        assert not errors,errors
        online_ws['socket'].send(json.dumps({'type':'snapshot','matchId':'1'*32,'tick':terminal_snapshot['tick'],'snapshot':terminal_snapshot}))
        online_ws['socket'].send(json.dumps({'type':'match-finished','matchId':'1'*32}))
        page.wait_for_function("document.querySelector('#onlineRewardStatus')?.textContent.includes('ONLINE TOKENS')",timeout=15000)
        assert api['rewardClaims']==[{'matchId':'1'*32}]
        assert '+30 ONLINE TOKENS' in page.locator('#onlineRewardStatus').inner_text()
        result_text=page.locator('#menu').inner_text()
        assert 'Brazil 2' in result_text and '0 Japan' in result_text, repr(result_text)
        page.locator('[data-action="navOnline"]').last.click()
        page.locator('[data-action="navOnlineCareer"]').click()
        page.wait_for_function("document.querySelector('#onlineCareerSeasonStatus')?.textContent.includes('Season and team collection are current')",timeout=15000)
        assert page.locator('[data-action="onlineCareerPlayNext"]').count()==1
        page.locator('[data-action="onlineCareerPlayNext"]').click()
        page.wait_for_function("document.querySelector('#menu')?.classList.contains('hidden') && window.NekketsuHD?.game.matchState === 'play' && window.NekketsuHD?.game.humans === 1",timeout=15000)
        assert api['onlineCareerTicketRequests']==1
        assert online_ws['socket'] is not None
        page.keyboard.down('ArrowRight')
        page.wait_for_timeout(500)
        page.keyboard.up('ArrowRight')
        assert online_inputs and all(packet['type']=='input' and set(packet['input']['buttons'])=={'pass','shoot','dribble','jump'} for packet in online_inputs)
        api['onlineCareerSeason']['playedCount']=1
        api['onlineCareerSeason']['fixtures'][0].update({'status':'completed','score':[1,0],'recordedAt':'2026-11-04T15:00:00.000Z'})
        api['onlineCareerSeason']['standings']=[
            {'teamId':'japan','played':1,'wins':1,'draws':0,'losses':0,'goalsFor':1,'goalsAgainst':0,'points':3,'goalDifference':1},
            {'teamId':'brazil','played':1,'wins':0,'draws':0,'losses':1,'goalsFor':0,'goalsAgainst':1,'points':0,'goalDifference':-1}
        ]
        career_terminal={**terminal_snapshot,'teamIds':['japan','brazil'],'score':[1,0]}
        online_ws['socket'].send(json.dumps({'type':'snapshot','matchId':'2'*32,'tick':career_terminal['tick'],'snapshot':career_terminal}))
        online_ws['socket'].send(json.dumps({'type':'match-finished','matchId':'2'*32}))
        page.wait_for_function("document.querySelector('#onlineRewardStatus')?.textContent.includes('ONLINE TOKENS')",timeout=15000)
        assert 'Career fixture 1 is complete' in page.locator('#menu').inner_text()
        assert api['rewardClaims'][-1]=={'matchId':'2'*32}
        page.locator('[data-action="navOnlineCareer"]').click()
        page.wait_for_function("document.querySelector('.fixture')?.textContent.includes('1/8 FIXTURES')",timeout=15000)
        assert 'Japan' in page.locator('[aria-label="Online Career season"]').inner_text()
        assert page.locator('[aria-label="Online Career season"]').inner_text().count('PLAYED')==1
        page.locator('[data-action="navOnline"]').last.click()
        assert not errors, errors
        context_auth.close()
        browser.close()
    httpd.shutdown()
    httpd.server_close()

    print('ONLINE_ACCOUNT_UI_BROWSER_PASS: optional config, real PKCE callback, server Career season/fixture/standings and CPU match, UT acquisition retry and role-checked lineup save, PVP lineup ticket binding, four-action input, reward settlement, preserved offline saves and accessible status')
