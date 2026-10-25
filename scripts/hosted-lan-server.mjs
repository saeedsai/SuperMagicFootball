// Render and other managed hosts supply PORT; the LAN broker reads LAN_PORT.
// Run in hosted mode only behind provider-managed HTTPS/WSS reverse proxy.
if(process.env.SMF_SIGNAL_MODE!=='hosted')throw Error('Hosted broker requires SMF_SIGNAL_MODE=hosted');
const port=Number(process.env.PORT);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Managed hosting must supply a valid PORT');
process.env.LAN_PORT=String(port);
process.env.LAN_BIND='0.0.0.0';
await import('./lan-server.mjs');
