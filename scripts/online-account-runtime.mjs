import {readFile} from 'node:fs/promises';
import {createOidcBearerVerifier} from './online-oidc-auth.mjs';
import {createOnlineAccountStore} from './online-account-store.mjs';
import {createOnlineResultStore} from './online-result-store.mjs';
import {createOnlineMatchLifecycleStore} from './online-match-lifecycle-store.mjs';
import {createOnlineRewardStore} from './online-reward-store.mjs';
import {createOnlineUltimateTeamStore} from './online-ultimate-team-store.mjs';
import {createOnlineCareerScheduleBuilder} from './online-career-schedule.mjs';
import {createOnlineCareerService} from './online-career-service.mjs';
import {createOnlineAccountApi} from './online-account-api.mjs';

const schemaUrl = new URL('./online-account-schema.sql', import.meta.url);
const resultsSchemaUrl = new URL('./online-results-schema.sql', import.meta.url);
const matchLifecycleSchemaUrl = new URL('./online-match-lifecycle-schema.sql', import.meta.url);
const rewardsSchemaUrl = new URL('./online-rewards-schema.sql', import.meta.url);
const ultimateTeamSchemaUrl = new URL('./online-ultimate-team-schema.sql', import.meta.url);
const onlineCareerSchemaUrl = new URL('./online-career-schema.sql', import.meta.url);
const exactOrigin = value => {
  try { const u = new URL(value); return u.origin === value && u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
};

/** Compose the remote-account API from deployment config and injected PG pool. */
export async function createOnlineAccountRuntime({env=process.env, pool, fetchImpl=globalThis.fetch, now=Date.now, matchmaking=null, canonicalTeamIds=null}={}) {
  if (!pool || typeof pool.query !== 'function' || typeof pool.connect !== 'function') throw new TypeError('Online account runtime requires a PostgreSQL pool');
  const databaseUrl = env.DATABASE_URL;
  if (typeof databaseUrl !== 'string' || !/^postgres(?:ql)?:\/\//i.test(databaseUrl)) throw new TypeError('DATABASE_URL must be a PostgreSQL connection string');
  const issuer = env.SMF_OIDC_ISSUER;
  const audience = env.SMF_OIDC_AUDIENCE;
  const jwksUrl = env.SMF_OIDC_JWKS_URL;
  const origins = typeof env.SMF_ALLOWED_ORIGINS === 'string' ? env.SMF_ALLOWED_ORIGINS.split(',').map(value=>value.trim()).filter(Boolean) : [];
  if (!origins.length || origins.length > 8 || origins.some(origin=>!exactOrigin(origin))) throw new TypeError('SMF_ALLOWED_ORIGINS must be a comma-separated list of exact HTTPS origins');
  const authenticate = createOidcBearerVerifier({issuer,audience,jwksUrl,fetchImpl,now});
  // DDL is idempotent; deployment fails closed if schema setup cannot finish.
  const [schema,resultsSchema,matchLifecycleSchema,rewardsSchema,ultimateTeamSchema,onlineCareerSchema] = await Promise.all([readFile(schemaUrl, 'utf8'),readFile(resultsSchemaUrl, 'utf8'),readFile(matchLifecycleSchemaUrl,'utf8'),readFile(rewardsSchemaUrl,'utf8'),readFile(ultimateTeamSchemaUrl,'utf8'),readFile(onlineCareerSchemaUrl,'utf8')]);
  if (!schema.trim() || schema.length > 65536) throw new Error('Online account schema is empty or too large');
  if (!resultsSchema.trim() || resultsSchema.length > 65536) throw new Error('Online result schema is empty or too large');
  if (!matchLifecycleSchema.trim() || matchLifecycleSchema.length > 65536) throw new Error('Online PVP lifecycle schema is empty or too large');
  if (!rewardsSchema.trim() || rewardsSchema.length > 65536) throw new Error('Online reward schema is empty or too large');
  if (!ultimateTeamSchema.trim() || ultimateTeamSchema.length > 65536) throw new Error('Online Ultimate Team schema is empty or too large');
  if (!onlineCareerSchema.trim() || onlineCareerSchema.length > 65536) throw new Error('Online Career schema is empty or too large');
  await pool.query(schema);
  await pool.query(resultsSchema);
  await pool.query(matchLifecycleSchema);
  await pool.query(rewardsSchema);
  await pool.query(ultimateTeamSchema);
  await pool.query(onlineCareerSchema);
  const store = createOnlineAccountStore({db:pool,now:()=>new Date(now())});
  const matchLifecycleStore=createOnlineMatchLifecycleStore({db:pool,now:()=>new Date(now())});
  const resultStore = createOnlineResultStore({db:pool,now:()=>new Date(now()),lifecycleStore:matchLifecycleStore});
  const rewardStore = createOnlineRewardStore({db:pool,resultStore,now:()=>new Date(now())});
  const ultimateTeamStore = await createOnlineUltimateTeamStore({db:pool,now:()=>new Date(now())});
  let onlineCareerSchedule=null,onlineCareerService=null;
  if(matchmaking&&Array.isArray(canonicalTeamIds)){
    onlineCareerSchedule=createOnlineCareerScheduleBuilder({canonicalTeamIds,isTeamOwned:(accountId,teamId)=>ultimateTeamStore.isItemOwned(accountId,'team',teamId)});
    onlineCareerService=createOnlineCareerService({db:pool,resultStore,buildSchedule:onlineCareerSchedule.buildSchedule,now:()=>new Date(now())});
  }
  const handle = createOnlineAccountApi({authenticate,store,resultStore,matchLifecycleStore,rewardStore,ultimateTeamStore,onlineCareerService,allowedOrigins:origins,matchmaking});
  return Object.freeze({handle,store,resultStore,matchLifecycleStore,rewardStore,ultimateTeamStore,onlineCareerSchedule,onlineCareerService,authenticate,allowedOrigins:Object.freeze(origins.slice())});
}
