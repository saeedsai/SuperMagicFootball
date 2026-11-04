// Bound both live sockets and handshakes before the WebSocket connection event.
export function createLanConnectionBudget({maxConnections=256,maxPerIp=8}={}){
 if(!Number.isSafeInteger(maxConnections)||maxConnections<1||maxConnections>4096||
    !Number.isSafeInteger(maxPerIp)||maxPerIp<1||maxPerIp>256)throw new TypeError('Invalid LAN connection budget');
 const reservations=new Map();
 const ipCounts=new Map();
 const countForIp=ip=>ipCounts.get(ip)||0;
 return Object.freeze({
  reserve(token,ip){
   if((typeof token!=='object'&&typeof token!=='function')||token===null||typeof ip!=='string'||!ip||reservations.has(token))return false;
   const ipCount=countForIp(ip);
   if(reservations.size>=maxConnections||ipCount>=maxPerIp)return false;
   reservations.set(token,{ip,connected:false});ipCounts.set(ip,ipCount+1);return true;
  },
  connect(token){const entry=reservations.get(token);if(!entry||entry.connected)return false;entry.connected=true;return true;},
  release(token){
   const entry=reservations.get(token);if(!entry)return false;
   reservations.delete(token);const count=countForIp(entry.ip);
   if(count<=1)ipCounts.delete(entry.ip);else ipCounts.set(entry.ip,count-1);
   return true;
  },
  get size(){return reservations.size;},
  countForIp
 });
}
