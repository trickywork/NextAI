import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

// Fallback values used when caller does not pass a file path/model explicitly.
const DEFAULT_FILE_PATH = "./uploads/your-default-file.pdf";
const DEFAULT_MODEL_NAME = "gpt-5.4-nano";

// Main QA pipeline over a single PDF.
// Input:
// - query: user question string
// - filePath: location of PDF to read
// Output:
// - LangChain response object (response.text contains final answer)
const chat = async (query, filePath = DEFAULT_FILE_PATH) => {
  // Guard clauses for common request mistakes.
  if (!query || typeof query !== "string") {
    throw new Error("`query` is required and must be a string.");
  }

  // Support both backend-style and frontend-style env key names.
  const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Set OPENAI_API_KEY in server/.env.");
  }

  // Step 1) Load the PDF into LangChain document objects.
  const loader = new PDFLoader(filePath);
  const data = await loader.load();

  // Step 2) Split long text into smaller chunks for embedding/retrieval.
  // Smaller chunks improve search precision and reduce context size per call.
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, // (in terms of number of characters)
    chunkOverlap: 0,
  });

  const splitDocs = await textSplitter.splitDocuments(data);

  // Step 3) Convert chunks to embeddings and store them in an in-memory vector DB.
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  // Step 4) (Optional manual retrieval test) can be enabled for debugging.
  // const relevantDocs = await vectorStore.similaritySearch(
  //   "What is task decomposition?"
  // );

  // Step 5) Build a RetrievalQA chain:
  // - Retriever finds relevant chunks from vectorStore
  // - Chat model answers using only retrieved context and prompt constraints
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_CHAT_MODEL || DEFAULT_MODEL_NAME,
    openAIApiKey: apiKey,
  });

  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}
Question: {question}
Helpful Answer:`;

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });

  // Execute end-to-end retrieval + answer generation.
  const response = await chain.call({
    query,
  });

  return response;
};

export default chat;
