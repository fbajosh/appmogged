# AppMogged

www.appmogged.com

## Local development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, builds the Vite app, and syncs `dist/` to the VM over SSH.

Configure these GitHub Actions secrets in the repository or production environment:

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_PORT` optional, defaults to `22`
- `DEPLOY_SSH_KEY`
- `DEPLOY_SSH_KNOWN_HOSTS`
- `DEPLOY_TARGET_DIR`
