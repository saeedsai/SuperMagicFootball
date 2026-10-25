// Signaling visibility and origin policy for LAN and separately deployed hosted rooms.
// Hosted mode is opt-in and MUST sit behind a TLS reverse proxy with abuse controls.
export function createLanSignalPolicy({mode='lan',publicOrigin}={}) {
  if(mode!=='lan'&&mode!=='hosted')throw new Error('Invalid signaling mode');
  if(mode==='hosted') {
    if(typeof publicOrigin!=='string'||!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(publicOrigin)||new URL(publicOrigin).origin!==publicOrigin)
      throw new Error('Hosted signaling requires an exact HTTPS public origin');
  }
  const isLanIp=ip=>ip==='::1'||ip==='127.0.0.1'||/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
  const sameSubnet=(a,b)=>a===b||(a!=='127.0.0.1'&&b!=='127.0.0.1'&&a!=='::1'&&b!=='::1'&&a.split('.').slice(0,3).join('.')===b.split('.').slice(0,3).join('.'));
  return Object.freeze({
    mode,
    allows(ip,origin,requestHost) {
      if(mode==='hosted')return origin===publicOrigin;
      if(!isLanIp(ip))return false;
      if(!origin)return true;
      try{return new URL(origin).host===requestHost}catch{return false}
    },
    visible(a,b){return mode==='hosted'||sameSubnet(a,b)}
  });
}
