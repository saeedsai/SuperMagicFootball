// Reachable HTTP game origins advertised by the companion server to LAN hosts.
// Never tell guests to browse localhost (that points to the guest's own device).
export function getLanGameUrls({interfaces,port,bind='0.0.0.0'}){
 if(!Number.isSafeInteger(port)||port<1||port>65535)throw new RangeError('Invalid LAN port');
 const ips=new Set();
 for(const entries of Object.values(interfaces||{}))for(const e of entries||[]){
  if(e.family!=='IPv4'||e.internal||typeof e.address!=='string')continue;
  if(bind!=='0.0.0.0'&&bind!==e.address)continue;
  if(!/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(e.address))continue;
  ips.add(e.address);
 }
 return [...ips].sort().map(ip=>'http://'+ip+':'+port);
}
