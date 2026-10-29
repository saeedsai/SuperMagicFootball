// A guest matches admission replies against BOTH its room and request ID.
export function rejectBusyLanJoin(ws,message,send){
 if(message?.type!=='join'||typeof message.roomId!=='string'||typeof message.requestId!=='string')return false;
 return send(ws,{type:'join-reject',roomId:message.roomId,requestId:message.requestId,reason:'room-full-or-version'});
}
