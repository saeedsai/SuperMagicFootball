# Publish Supermagic Football using GitHub Pages (branch source)

**Required one-time action in your GitHub account**

The game has already been committed to the root of the public repository `saeedsai/SuperMagicFootball`. There is no build step; the root `index.html` loads `src/`, `data/`, and `style.css` as static files.

1. Open https://github.com/saeedsai/SuperMagicFootball/settings/pages while signed in.
2. Under **Build and deployment → Source**, choose **Deploy from a branch** (NOT GitHub Actions).
3. Set **Branch = main** and **Folder = /(root)**, then select **Save**.
4. Open the repository's **Actions** tab and check the **pages-build-deployment** run, or return to Settings → Pages to check for **Visit site**.
5. After GitHub confirms publication, open https://saeedsai.github.io/SuperMagicFootball/ on your phone and use landscape orientation.

The earlier custom workflow failed in `actions/configure-pages@v5` because the Pages site had not been initialized. That workflow was removed to avoid repeated errors; **GitHub automatically generates its Pages deployment run after you select the branch publishing source**.

If you still see the *Get Pages site failed* error, you are viewing an old run from the removed workflow. Check the latest `pages-build-deployment` instead.

If there is no new deployment after saving, return to Settings → Pages and confirm **Deploy from a branch / main / /(root)**. GitHub Pages must be enabled in repository settings; committing the files alone does not enable it. If a deployment fails, open that specific run for the new error.

No downloads or local server are needed after Pages has published the site. The site is publicly accessible because the repository is public.
