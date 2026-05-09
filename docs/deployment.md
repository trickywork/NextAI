# NextAI Deployment

Cloud Run service:

```text
nextai
```

Current URL:

```text
https://nextai-gb7rmueyna-uc.a.run.app
```

Custom domain mapping:

```text
nextai.junliu.dev
```

The custom domain is configured in Cloud Run and Cloudflare. Google-managed SSL certificate provisioning may take time after DNS changes.

## Cloud Build

The repo contains `cloudbuild.yaml`. The trigger `nextai-main-deploy` deploys on GitHub pushes to `main`.

Manual deploy:

```bash
gcloud builds submit --config cloudbuild.yaml --project caramel-vim-441513-e1
```

Runtime settings:

```text
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_API_KEY=Secret Manager: nextai-openai-api-key
```

Cost controls:

- Cloud Run `min-instances=0`.
- Cloud Run `max-instances=1`.
- Uploaded PDFs are stored in container local filesystem, so files are temporary and no paid bucket is required.

## Local Development

Install frontend and backend dependencies:

```bash
npm install
cd server
npm install
```

Run both:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5001`
