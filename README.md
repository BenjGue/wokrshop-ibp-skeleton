# Workshop skeleton — IBP Chat

Starting point for the Opella IBP workshop. Follow the workshop instructions provided by your facilitator.

## Local dev

```sh
cd ibp-chat
npm install
gh auth refresh --scopes copilot   # one-time, gives the Copilot SDK a token
npm run dev
```

Open http://localhost:3100.

## Deploy (Dokploy)

This repo ships a `docker-compose.yml` at the root. Dokploy auto-deploys on push to `main`.
Set `GITHUB_TOKEN` (scope: `copilot`) in the Dokploy app's Environment tab.
