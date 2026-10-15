// Supermagic Football v0.8.25.30 | PLAYERIDENTITY | independently editable module
const PLAYERIDENTITY=(()=>{/**
 * Conservative canonical-identity index for curated roster data.
 *
 * A name is NOT an identity: fictional placeholders, homonyms, and an unverified
 * national-team row must never be silently merged into a verified club player.
 * Identity IDs are derived only when a dated, club/role-verified record also has
 * a validated birth date. Local roster slot IDs remain unchanged for saves.
 */
function normalizePersonName(name) {
  return String(name ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g,"'").replace(/[^a-zA-Z0-9' -]/g,' ')
    .toLowerCase().replace(/[\s'-]+/g,' ').trim();
}
function isPlaceholderIdentity(player) {
  const name = normalizePersonName(player?.name);
  return player?.fictional === true || /^(academy prospect|youth prospect|generic player|placeholder)(\s|$)/.test(name);
}
function validBirthDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y,m,d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y,m-1,d));
  return y >= 1880 && y <= 2026 && dt.getUTCFullYear() === y && dt.getUTCMonth() === m-1 && dt.getUTCDate() === d;
}
function canonicalPersonId(player) {
  if (!player || player.rosterVerification !== 'verified_club_role' ||
      isPlaceholderIdentity(player) || !validBirthDate(player.birthDate)) return null;
  const name = normalizePersonName(player.name);
  return name ? `person:${name.replace(/ /g,'-')}:${player.birthDate}` : null;
}
/**
 * teamRows: [{teamId,teamName,players:[{id,name,role,...}]}]
 * Reports candidates; does not mutate player records, roles, save IDs or stats.
 */
function buildIdentityRegistry(teamRows) {
  const byPerson = new Map(), byName = new Map(), slotIds = new Set();
  const errors = [], slots = [];
  for (const team of teamRows) {
    for (const player of team.players || []) {
      const slot = {teamId:team.teamId,teamName:team.teamName,
        playerId:player.id,name:player.name,role:player.role,
        birthDate:player.birthDate||'',verification:player.rosterVerification||'',
        placeholder:isPlaceholderIdentity(player),canonicalId:canonicalPersonId(player)};
      const slotId = `${team.teamId}::${player.id}`;
      if(slotIds.has(slotId))errors.push({kind:'duplicate_save_slot',slotId});
      slotIds.add(slotId);
      slots.push(slot);
      const name = normalizePersonName(player.name);
      if (name) {if(!byName.has(name))byName.set(name,[]);byName.get(name).push(slot);}
      if (slot.canonicalId) {
        if(!byPerson.has(slot.canonicalId))byPerson.set(slot.canonicalId,[]);
        byPerson.get(slot.canonicalId).push(slot);
      }
    }
  }
  const candidates=[],placeholderCollisions=[];
  for (const [name,group] of byName) {
    if (group.length < 2) continue;
    const roles=[...new Set(group.map(s=>s.role))].sort();
    const real=group.filter(s=>!s.placeholder);
    const isPlaceholder = real.length === 0;
    const rec={name,slots:group.length,roles,roleConflict:roles.length>1,
      verifiedIds:[...new Set(group.map(s=>s.canonicalId).filter(Boolean))].sort(),
      playerIds:group.map(s=>s.playerId),teams:group.map(s=>s.teamName),
      disposition:isPlaceholder?'independent_fictional_placeholders':'unverified_same_name_candidate'};
    if(isPlaceholder)placeholderCollisions.push(rec);
    else {
      if (rec.verifiedIds.length===1 && group.every(s=>s.canonicalId===rec.verifiedIds[0]))rec.disposition='verified_same_person';
      else if (rec.verifiedIds.length>1)rec.disposition='verified_name_birthdate_conflict_review';
      candidates.push(rec);
    }
  }
  return {slots,persons:[...byPerson].map(([canonicalId,entries])=>({canonicalId,
    playerIds:entries.map(s=>s.playerId),teams:entries.map(s=>s.teamName),roles:[...new Set(entries.map(s=>s.role))]})),
    candidates,placeholderCollisions,errors,
    summary:{totalSlots:slots.length,verifiedIdentitySlots:slots.filter(s=>s.canonicalId).length,
      distinctVerifiedPeople:byPerson.size,nameCollisionGroups:candidates.length+placeholderCollisions.length,
      realNameRoleConflicts:candidates.filter(c=>c.roleConflict).length,
      placeholderRoleConflicts:placeholderCollisions.filter(c=>c.roleConflict).length,
      candidateUnverifiedLinks:candidates.filter(c=>c.disposition==='unverified_same_name_candidate').length,
      rejectedInvalidVerifiedDOB:slots.filter(s=>s.verification==='verified_club_role'&&!s.canonicalId).length,
      integrityErrors:errors.length}};
}

return {normalizePersonName,isPlaceholderIdentity,validBirthDate,canonicalPersonId,buildIdentityRegistry};})();

export {PLAYERIDENTITY};
