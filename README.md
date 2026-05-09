# NextAI (PDF Q&A + Voice Chat)

A full-stack app that lets you:
- upload a PDF
- ask questions about that PDF (RAG with LangChain)
- optionally use voice chat mode (speech recognition + text-to-speech)

Frontend: React + Ant Design  
Backend: Express + Multer + LangChain + OpenAI

## Features

- PDF upload to backend (`/upload`)
- Question answering over uploaded PDF (`/chat?question=...`)
- Conversation history UI
- Voice chat mode:
  - speech recognition (microphone -> text)
  - text-to-speech (assistant answer -> audio)

## Tech Stack

- Frontend: `react`, `antd`, `axios`, `speak-tts`, `react-speech-recognition`
- Backend: `express`, `multer`, `dotenv`, `langchain`

## Project Structure

```txt
nextai/
  src/
    App.js
    components/
      ChatComponent.js
      PdfUploader.js
      RenderQA.js
  server/
    server.js      # Express API (/upload, /chat)
    chat.js        # LangChain PDF QA pipeline
    uploads/       # Uploaded PDFs
```

## Environment Variables

Create these files:

1) Root `.env`:

```env
REACT_APP_DOMAIN=http://localhost:5001
```

2) `server/.env`:

```env
OPENAI_API_KEY=your_openai_key
# Optional:
# OPENAI_CHAT_MODEL=gpt-5.4-nano
# PORT=5001
```

Notes:
- Backend currently supports both `OPENAI_API_KEY` and `REACT_APP_OPENAI_API_KEY`.
- Use `OPENAI_API_KEY` going forward.

## Install

From project root:

```bash
npm install
cd server && npm install && cd ..
```

## Run

From project root:

```bash
npm run dev
```

This runs:
- frontend at `http://localhost:3000`
- backend at `http://localhost:5001`

If port 3000 is occupied:

```bash
kill -9 $(lsof -ti :3000)
npm run dev
```

## API Endpoints

### 1) Upload PDF

`POST /upload`

- Content type: `multipart/form-data`
- Field name: `file`

Example with curl:

```bash
curl -X POST http://localhost:5001/upload \
  -F "file=@/absolute/path/to/your.pdf"
```

### 2) Ask Question

`GET /chat?question=...`

Example:

```bash
curl "http://localhost:5001/chat?question=What%20is%20this%20pdf%20about%3F"
```

Important:
- You must upload a PDF first after each server restart.
- Do not wrap question with extra single quotes.

## Frontend Flow

1) `PdfUploader` uploads selected file to backend.
2) `ChatComponent` sends user question to `/chat`.
3) `RenderQA` shows question/answer bubbles.
4) In voice mode, recognized speech is auto-submitted and responses are spoken.

## Backend Flow

In `server/chat.js`:
1) Load uploaded PDF
2) Split text into chunks
3) Generate embeddings
4) Store chunks in in-memory vector store
5) Run retrieval QA chain and return answer

In `server/server.js`:
- `filePath` is stored in memory and points to the latest uploaded file.
- This resets when server restarts.

## Cloud Deployment

- Cloud Run service: `nextai`
- Current URL: `https://nextai-gb7rmueyna-uc.a.run.app`
- Custom domain mapping: `nextai.junliu.dev`
- GitHub trigger: `nextai-main-deploy`

Deployment config lives in `Dockerfile` and `cloudbuild.yaml`. More notes are in `docs/deployment.md`.

## Configuration Notes

Non-code setup is documented in `docs/configuration.md`, including env files, OpenAI Secret Manager setup, temporary upload storage, and the fact that this project does not use a database.

## Postman

Import `postman/NextAI.postman_collection.json`.

Set:

```text
baseUrl=http://localhost:5001
pdfPath=/absolute/path/to/sample.pdf
```

For Cloud Run, set `baseUrl` to `https://nextai-gb7rmueyna-uc.a.run.app`.
