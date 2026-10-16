// Current FC27 positional contract supersedes the archived hardcoded 2026 first XI.
// Keep core position, identity, rated shortlist, runtime, and match boot assertions.
import {verifyCurrentClub} from './current_fc27_club_contract.mjs';
for(const club of ["Bayern Munich","Paris Saint-Germain"])verifyCurrentClub(club);
console.log('PASS current FC27 source and positional club contract: Bayern Munich, Paris Saint-Germain');
