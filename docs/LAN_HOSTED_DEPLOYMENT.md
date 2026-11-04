# Hosted LAN discovery deployment (GitHub Pages)

## Current service status (2 November 2026)

The Render service already exists as supermagicfootball-lan-signal at https://supermagicfootball-lan-signal.onrender.com. Render reports it as live on the dev branch, Frankfurt region, Free plan, with automatic deploys enabled. Its current live deployment is commit 3da2f0c (LAN-094), which is older than the local 0.12.50.0 candidate. Do not treat current local changes or this report as a deployment.

Local read-only endpoint checks on 2 November returned HTTP 200 with body ok from /healthz, and HTTP 101 WebSocket Switching Protocols from /lan-signal with Origin https://saeedsai.github.io. These verify endpoint availability and the configured origin gate only; they do not verify room pairing, WebRTC gameplay, cross-network reliability, load, or physical devices. The Free plan can cold-start after inactivity. A provisioned service is not proof that the latest game candidate is live.

The game source already defaults GitHub Pages to this WSS endpoint in src/modules/lan-auto-signal.js; an SMF_LAN_SIGNAL_URL override is only needed to use another broker. Current implementation enables Internet P2P by using the SMF_P2P_SIGNAL_URL override or the same hosted default.

The static Pages website cannot host a WebSocket signaling service or automatically discover devices on private networks. The existing Node broker supports `SMF_SIGNAL_MODE=hosted` and restricts WebSocket Origin to `https://saeedsai.github.io`.

## Reprovision or verify deployment

1. Reuse the active Render service unless it needs to be recreated. Reprovisioning requires Render authorization and a plan choice; the current live service is Free while render.yaml requests Starter.
2. After any deployment, check the actual assigned hostname and confirm the Render deployment is live for the expected commit.
3. Verify the health endpoint and WebSocket handshake using Origin https://saeedsai.github.io. A browser address bar cannot test WebSocket.
4. GitHub Pages already selects the hosted default broker. If using another service, configure the correct WSS override. Run Node and Chromium acceptance for the exact candidate, then promote through the protected release pipeline.
5. Test two distinct browsers on the same Wi-Fi: Host Game, Find Games, guest request, host approval, offer/answer, WebRTC channel, kickoff, controls, reconnect, leave and rejoin. Test two physical devices before claiming LAN certification.

## Security and operational limitations

The hosted broker is a rendezvous service, not LAN multicast discovery; hosted rooms are not certified same-Wi-Fi-only. New clients leave Internet P2P rooms unlisted by default and expose the cryptographically random room ID as an invite code. Anyone with the code can request to join, but host approval remains mandatory. Hosts may explicitly opt into the global directory. Older clients that omit the listing choice retain their previous public-listing behavior for compatibility. This is directory privacy, not account authentication, room secrecy after sharing the code, or encryption of lobby/signaling metadata. Never send game saves, passwords or private information. The broker has rate, payload, room, pending-request, per-IP and global connection limits (`LAN_MAX_CONNECTIONS`, default 256; maximum 4,096), plus a 512 KiB/s per-peer Internet-relay ingress budget. Production monitoring, abuse protection and load testing remain necessary. Browser-to-browser WebRTC may need a managed TURN relay on networks where direct peer connection fails. A paid plan incurs ongoing costs and requires owner authorization and billing; the currently reported Free plan may cold-start or suspend. The GitHub connector cannot create a Render service or provide billing credentials.

The service is provisioned and its health/WebSocket handshake were verified, but current code is not deployed and physical-device gameplay is untested. Public Pages may use the configured broker, but the game must report a truthful connection or service error and must not claim matchmaking succeeded until a room is actually hosted or found.
