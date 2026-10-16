/** Keep the offline exclusive-claim protocol protected by normal Node + census CI.
 * Runs FakeClient-only unit tests; never authenticates, mutates GitHub, or opens network.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const path=require('node:path');

test('exclusive feature locks reject stale SHA, takeover, and invalid handover',()=>{
 const root=path.resolve(__dirname,'..');
 const out=spawnSync('python3',['-m','unittest','discover','-s','tests',
  '-p','test_feature_claim.py','-v'],{
   cwd:root,encoding:'utf8',timeout:25000,maxBuffer:1024*1024,
   env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}
 });
 assert.ifError(out.error||null);
 assert.equal(out.signal,null,'offline claim tests must not time out');
 assert.equal(out.status,0, `Feature-claim protocol tests failed:\n${out.stdout}\n${out.stderr}`);
 assert.match(out.stderr,/Ran 10 tests/,'CI must cover all 10 claim protocol tests');
 assert.match(out.stderr,/\bOK\b/);
});
