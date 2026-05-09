# NextAI

NextAI is a full-stack PDF question-answering and voice chat app. Users upload a PDF, ask questions about its content, and optionally use browser speech recognition plus text-to-speech for a voice-style assistant flow.

## Live Demo

- Portfolio URL: `https://nextai.junliu.dev`
- Cloud Run service: `nextai`
- Cloud Run URL: `https://nextai-888561484971.us-central1.run.app`
- Google Cloud project: `caramel-vim-441513-e1`
- Region: `us-central1`

## Tech Stack

- Frontend: React 18, Ant Design, Axios
- Voice features: `react-speech-recognition`, `speak-tts`
- Backend: Node.js, Express, Multer
- AI/RAG: LangChain, OpenAI embeddings, OpenAI chat model, in-memory vector store
- Deployment: Docker, Google Cloud Build, Google Cloud Run
- API testing: Postman collection in `postman/NextAI.postman_collection.json`

## Project Structure

```text
nextai/
  src/
    App.js
    components/
      ChatComponent.js
      PdfUploader.js
      RenderQA.js
  server/
    server.js
    chat.js
    uploads/
  docs/
    configuration.md
    deployment.md
  postman/
    NextAI.postman_collection.json
  Dockerfile
  cloudbuild.yaml
```

## Environment Variables

Root `.env` for the React app:

```env
REACT_APP_DOMAIN=http://localhost:5001
```

`server/.env` for the Express API:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4o-mini
PORT=5001
UPLOAD_DIR=server/uploads
```

Notes:

- `OPENAI_API_KEY` is required for local AI responses.
- `OPENAI_CHAT_MODEL` is optional; the backend defaults to a small OpenAI chat model when omitted.
- Uploaded PDFs are stored locally during development and in container-local temporary storage on Cloud Run.
- There is no database. The latest uploaded PDF path is kept in memory and resets when the server restarts.

## Local Development

Install dependencies from the repo root:

```bash
npm install
cd server
npm install
cd ..
```

Run frontend and backend together:

```bash
npm run dev
```

Expected local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5001
```

If you only want the backend:

```bash
npm run server
```

## How To Use

1. Open the frontend.
2. Upload a PDF file.
3. Ask a question about the uploaded document.
4. Turn on voice mode if you want microphone input and spoken answers.

Expected result:

- Upload succeeds and the UI confirms the file is available.
- A question such as "What is this document about?" returns an answer grounded in the uploaded PDF.
- Conversation history remains visible in the chat panel.
- Voice mode can submit recognized speech and speak the assistant response in supported browsers.

## API Endpoints

### Upload PDF

```http
POST /upload
```

Request type: `multipart/form-data`

Field name:

```text
file
```

Example:

```bash
curl -X POST http://localhost:5001/upload \
  -F "file=@/absolute/path/to/sample.pdf"
```

### Ask Question

```http
GET /chat?question=...
```

Example:

```bash
curl "http://localhost:5001/chat?question=What%20is%20this%20PDF%20about%3F"
```

Important: upload a PDF after each backend restart before calling `/chat`.

## Postman

Import:

```text
postman/NextAI.postman_collection.json
```

Suggested variables:

```text
baseUrl=http://localhost:5001
pdfPath=/absolute/path/to/sample.pdf
```

For Cloud Run testing:

```text
baseUrl=https://nextai-888561484971.us-central1.run.app
```

## Build

```bash
npm run build
```

The Docker deployment builds the React frontend and serves it together with the Express backend.

## Cloud Deployment

Manual deployment:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --project caramel-vim-441513-e1
```

Cloud Run is configured for low-cost portfolio hosting:

- `min-instances=0`
- small container footprint
- no database
- no persistent storage
- OpenAI API usage is the main variable runtime cost

## Expected Portfolio Behavior

The deployed app should let a visitor upload a PDF, ask at least one question, and see a generated answer. Because this is a portfolio demo, uploaded files and chat context are temporary and should not be treated as permanent user data.

## Additional Notes

More setup details are kept in:

- `docs/configuration.md`
- `docs/deployment.md`
