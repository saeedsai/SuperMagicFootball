// Hosted signaling uses the edge proxy's client IP to approximate same-network discovery.
// Never use socket.remoteAddress on Render: it identifies the load balancer, not the player.
import {isIP} from 'node:net';
export function lanClientIp(request,{hosted=false}={}){
 const socketIp=String(request?.socket?.remoteAddress||'').replace(/^::ffff:/,'');
 if(!hosted)return socketIp;
 const forwarded=request?.headers?.['x-forwarded-for'];
 if(typeof forwarded!=='string'||forwarded.length>512)return '';
 const first=forwarded.split(',')[0].trim().replace(/^::ffff:/,'');
 return isIP(first)?first:'';
}
function ipv6Prefix64(ip){
 if(isIP(ip)!==6||ip.includes('.'))return null;
 const halves=ip.toLowerCase().split('::');
 if(halves.length>2)return null;
 const left=halves[0]?halves[0].split(':'):[];
 const right=halves.length===2&&halves[1]?halves[1].split(':'):[];
 const missing=8-left.length-right.length;
 if(missing<0||halves.length===1&&missing!==0)return null;
 const expanded=halves.length===2?[...left,...Array(missing).fill('0'),...right]:left;
 return expanded.slice(0,4).map(s=>Number.parseInt(s,16)).join(':');
}
export function samePublicNetwork(a,b){
 const first=isIP(a),second=isIP(b);
 if(first===4&&second===4)return a===b;
 if(first===6&&second===6){const x=ipv6Prefix64(a),y=ipv6Prefix64(b);return x!==null&&x===y;}
 return false;
}
