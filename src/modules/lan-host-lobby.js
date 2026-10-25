import { createLanJoinRequests } from './lan-join-requests.js';

// A two-player LAN room has exactly one guest seat. This host-side admission
// state is independent of transport; the signaling service must authenticate
// requester identity and deliver decisions only to the matching connection.
export function createLanHostLobby({ roomId, ...requestOptions } = {}) {
  const requests = createLanJoinRequests({ roomId, ...requestOptions });
  let admittedRequestId = null;
  let closed = false;
  return Object.freeze({
    receive(packet) {
      return !closed && admittedRequestId === null && requests.receive(packet);
    },
    pending() {
      return closed ? [] : requests.list();
    },
    decide(requestId, accept) {
      if (closed || (accept === true && admittedRequestId !== null)) return null;
      const decision = requests.decide(requestId, accept);
      if (decision?.type === 'join-accept') admittedRequestId = requestId;
      return decision;
    },
    guest() {
      return admittedRequestId === null ? null : Object.freeze({ requestId: admittedRequestId });
    },
    disconnect(requestId) {
      if (closed || admittedRequestId !== requestId || typeof requestId !== 'string') return false;
      admittedRequestId = null;
      return true;
    },
    close() {
      closed = true;
      admittedRequestId = null;
      requests.clear();
    }
  });
}
