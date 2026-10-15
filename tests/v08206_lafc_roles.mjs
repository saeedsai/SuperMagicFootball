// LAFC named-player identity and keeper allocation under current FC27 selection.
import assert from 'node:assert/strict';
import {verifyCurrentClub} from './current_fc27_club_contract.mjs';
const {players}=verifyCurrentClub('Los Angeles FC','continental');
const cleaned=s=>s.normalize('NFKD').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const son=players.find(p=>cleaned(p.name)===cleaned('Son Heung-min'));
assert(son,'LAFC must include Son Heung-min regardless of source punctuation');
assert.equal(son.role,'FW','Son must be treated as a forward');
assert.equal(players.filter(p=>p.role==='GK').length,2,'two real club goalkeepers');
assert(players.every(p=>p.fictional===false),'no fictional LAFC players');
console.log('PASS current FC27 LAFC positional and named-player contract');
