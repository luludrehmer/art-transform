# Deploy art-transform as ai.art-and-see.com

This app is set up for **Replit** (see `.replit`). To serve it at **ai.art-and-see.com**:

## 1. Deploy on Replit

1. Open the art-transform project on Replit.
2. Use **Deploy** (or configure Deployment in project settings).
3. The `.replit` file already defines:
   - `build = ["npm", "run", "build"]`
   - `run = ["npm", "run", "start"]`
4. Ensure `npm run build` and `npm run start` work (client build + server start). After deploy, Replit gives you a URL (e.g. `*.replit.app` or your custom domain).

## 2. Custom domain (ai.art-and-see.com)

1. In Replit: open the project → **Settings** → **Domains** (or **Custom domain**).
2. Add **ai.art-and-see.com**.
3. Replit will show instructions (usually a **CNAME** record or, in some cases, an A record). Note the target host (e.g. `replit.com` or a specific deploy host).
4. In your DNS provider (where art-and-see.com is managed):
   - Create a **CNAME** record: name **ai**, value = the target Replit gave you.
   - Or follow the exact record type and value Replit shows.
5. Wait for DNS propagation (minutes to a few hours). Then open https://ai.art-and-see.com and test.

## 3. Environment variables (Replit Secrets / Env)

Set these in Replit (Tools → Secrets or project env):

| Variable | Purpose |
|----------|---------|
| `ART_TRANSFORM_PUBLIC_URL` | **https://ai.art-and-see.com** — used for image links and redirects; must match the custom domain. |
| `MEDUSA_STOREFRONT_URL` | Storefront URL (e.g. **https://portraits.art-and-see.com**) for checkout redirect. |
| (others) | Database, auth, Medusa backend URL, etc. as in `.env.example`. |

After changing env vars, redeploy if needed so the new values are used.

## 4. Summary

- **Deploy:** Replit → Deploy (build + run from `.replit`).
- **Domain:** Replit Settings → Domains → add ai.art-and-see.com → create CNAME (or A) in DNS.
- **Env:** `ART_TRANSFORM_PUBLIC_URL=https://ai.art-and-see.com`, `MEDUSA_STOREFRONT_URL`, and the rest from `.env.example`.
