import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const DEFAULT_FILE_PATH = "./uploads/your-default-file.pdf";
const DEFAULT_MODEL_NAME = "gpt-5.4-nano";

const chat = async (query, filePath = DEFAULT_FILE_PATH) => {
  if (!query || typeof query !== "string") {
    throw new Error("`query` is required and must be a string.");
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Set OPENAI_API_KEY in server/.env.");
  }

  // step 1:
  const loader = new PDFLoader(filePath);
  const data = await loader.load();

  // step 2:
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, // (in terms of number of characters)
    chunkOverlap: 0,
  });

  const splitDocs = await textSplitter.splitDocuments(data);

  // step 3
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  // step 4: retrieval
  // const relevantDocs = await vectorStore.similaritySearch(
  //   "What is task decomposition?"
  // );

  // step 5: qa w/ customize the prompt
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

  const response = await chain.call({
    query,
  });

  return response;
};

export default chat;
