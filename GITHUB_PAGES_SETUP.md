# Playing Supermagic Football on a phone via GitHub Pages

1. Upload the **contents** of this folder to the root of your repository's `main` branch so `index.html` lives in the repository root.
2. In GitHub, open **Settings → Pages**. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Go to **Actions → Publish Supermagic Football** and confirm the latest workflow succeeded; use **Run workflow** if no run occurred automatically.
4. Open `https://saeedsai.github.io/SuperMagicFootball/` in Safari (iOS) or Chrome (Android). This is the expected URL, not a verified live deployment URL.
5. Landscape mode is recommended. Once serving over HTTPS, browser-local saves and service worker capabilities can be tested on a real origin.

The site is a static ES-module app: `index.html`, `style.css`, `src/`, `data/` and `sw.js` must remain together. No backend or build step is required. Do not just upload the ZIP into the repository; extract and commit the files.

## GitHub connector access

To let ChatGPT publish automatically: go to GitHub → Settings → Applications → Installed GitHub Apps, select the ChatGPT GitHub app, choose **Configure** and grant it access to the `saeedsai/SuperMagicFootball` repository. This app was connected to the `saeedsai` account but initially only had `saeedsai/MYMMORPG` available. After access is granted, ask ChatGPT to retry the upload.
