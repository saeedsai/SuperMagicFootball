# Invite-code copy UI browser recheck

Command: python tests/browser_runner_compat.py tests/p2p_invite_copy_browser_qa.py

Result: **PASS** on Chromium with simulated touch. The actual game page loaded, the hosted lobby rendered a separate share field, the generated room ID matched the expected 128-bit format, the copy button wrote that exact ID to the clipboard, and the control had an accessible label.

The broad four-shard Chromium census (162 scripts) ran before this final copy-field refinement. Its two isolated reruns are separately documented in the integrated acceptance report. The updated UI code is covered by this focused browser check and the passing full Node suite (1,596/1,596).
