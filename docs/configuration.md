# NextAI Configuration

This file records the non-code setup needed to run, test, and redeploy NextAI.

## Runtime Shape

NextAI is a React frontend plus Express backend. In production the Express server also serves the compiled React build from `build/`.

There is no relational database in this project.

Runtime state:

- Uploaded PDFs are written to `server/uploads/` locally, or to the container filesystem on Cloud Run.
- The latest uploaded PDF path is held in server memory.
- LangChain `MemoryVectorStore` is rebuilt per chat request from the uploaded PDF.
- All uploaded files and in-memory state disappear when the process or Cloud Run instance restarts.

## Local Environment Files

Root `.env` for the React dev server:

```env
REACT_APP_DOMAIN=http://localhost:5001
```

Backend `server/.env`:

```env
PORT=5001
OPENAI_API_KEY=your_openai_key
OPENAI_CHAT_MODEL=gpt-4o-mini
UPLOAD_DIR=./uploads
```

Use `server/.env.example` as the template. Do not commit real API keys.

## Local Startup

```bash
cd nextai
npm install
cd server
npm install
cd ..
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5001`

## API Testing

Postman collection:

```text
NextAI - Portfolio API Smoke Tests
```

Variables:

```text
baseUrl=http://localhost:5001
pdfPath=/absolute/path/to/sample.pdf
```

Test order:

1. `POST /upload` with form-data key `file`.
2. `GET /chat?question=...`.

## Cloud Resources

Google Cloud project:

```text
caramel-vim-441513-e1
```

Region:

```text
us-central1
```

Cloud Run service:

```text
nextai
```

Cloud Run URL:

```text
https://nextai-gb7rmueyna-uc.a.run.app
```

Custom domain:

```text
nextai.junliu.dev
```

Cloud Build trigger:

```text
nextai-main-deploy
```

Secret Manager:

```text
nextai-openai-api-key -> OPENAI_API_KEY
```

Cloud Run env vars:

```text
OPENAI_CHAT_MODEL=gpt-4o-mini
```

## Cost Notes

- No Cloud SQL or storage bucket is required for the current demo deployment.
- Cloud Run is configured for `min-instances=0`.
- Every request that asks the model a question can incur OpenAI API cost.
- Uploaded PDFs are temporary because they live on local container storage.

## Production Upgrade Notes

Use these only if this becomes more than a portfolio demo:

- Store PDFs in Cloud Storage.
- Store document metadata and chat history in Firestore or PostgreSQL.
- Cache or persist vector indexes instead of rebuilding the vector store per request.
