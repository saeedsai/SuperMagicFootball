/** Ensure Python QA-framework safety tests run in the existing Node census.
 * No CI workflow edits or game fixture changes required.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const path=require('node:path');

test('regression census rejects empty shards and migrates only owned browser tests',()=>{
 const root=path.resolve(__dirname,'..');
 const result=spawnSync('python3',['-m','unittest','discover','-s','tests',
  '-p','test_full_regression_runner.py','-v'],{
  cwd:root,encoding:'utf8',timeout:25000,maxBuffer:1024*1024
 });
 assert.ifError(result.error||null);
 assert.equal(result.signal,null,'safety contract must not time out');
 assert.equal(result.status,0,
  'Python QA regression contracts failed:\\n'+result.stdout+'\\n'+result.stderr);
 assert.match(result.stderr,/Ran 7 tests/);
 assert.match(result.stderr,/OK/);
});
