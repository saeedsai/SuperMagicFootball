// Public browser configuration only. Never place client secrets or bearer tokens here.
// Set the fields below for an OIDC-backed account build. Empty values keep all
// offline game modes available and make the online account routes show setup status.
window.SMF_ONLINE_CONFIG = Object.freeze({
  apiOrigin: '',
  issuer: '',
  clientId: '',
  audience: '',
  redirectUri: '',
});
