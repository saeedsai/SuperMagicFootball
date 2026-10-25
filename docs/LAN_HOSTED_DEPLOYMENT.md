# Hosted LAN discovery deployment (GitHub Pages)

The static Pages website cannot host a WebSocket signaling service or automatically discover devices on private networks. The existing Node broker supports `SMF_SIGNAL_MODE=hosted` and restricts WebSocket Origin to `https://saeedsai.github.io`.

## Provision

1. Authorize Render to deploy this GitHub repository and create a Blueprint from `render.yaml` on the **main** branch. This provisions a Node service behind Render-managed HTTPS/WSS; the paid Starter plan avoids free-instance sleep delays.
2. Wait for Render's successful deployment and copy the **actual** assigned HTTPS service hostname. Do not assume the service name guarantees a specific hostname.
3. Verify `https://<assigned-host>/` returns HTTP 200 and `wss://<assigned-host>/lan-signal` accepts an Origin of `https://saeedsai.github.io`; a browser address bar cannot test WebSocket.
4. Set `globalThis.SMF_LAN_SIGNAL_URL='wss://<assigned-host>/lan-signal'` in a small configuration script loaded before the game module, then commit the exact verified URL to `dev`. Do not insert a guessed endpoint. Run full Node and Chromium regression and promote through the protected release pipeline.
5. Test two distinct browsers on the same Wi-Fi: Host Game, Find Games, guest request, host approval, offer/answer, WebRTC channel, kickoff, controls, reconnect, leave and rejoin. Test two physical devices before claiming LAN certification.

## Security and operational limitations

The hosted broker is a rendezvous service, not LAN multicast discovery: its hosted visibility policy currently allows all connected users to see rooms, **not only users on the same Wi-Fi**. Host approval is mandatory. A future release must add an explicit privacy-preserving LAN pairing/discovery scope before marketing same-network-only discovery. Signaling carries SDP and room metadata; never send game saves, passwords or private information. The broker has rate, payload, room, pending-request and per-IP limits but production monitoring, abuse protection and load testing remain necessary. Browser-to-browser WebRTC may need a managed TURN relay on networks where direct peer connection fails. A hosted backend incurs ongoing costs and requires owner authorization and billing. The GitHub connector cannot create a Render service or provide billing credentials.

This document and `render.yaml` are deployable infrastructure **configuration**, not evidence of an active backend. Until the assigned WSS URL is committed and physical tests pass, public Pages Host/Find must continue to report unconfigured rather than claim a room was created.
