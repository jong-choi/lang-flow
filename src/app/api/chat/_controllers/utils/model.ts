import { ChatGoogle } from "@langchain/google-gauth";

export const MAX_MESSAGES_LEN = 10;
const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;

// 환경변수 확인
const OLLAMA_HOST = process.env.ORACLE_OLLAMA_HOST;
if (!OLLAMA_HOST) {
  console.error("ORACLE_OLLAMA_HOST environment variable is not set"); //디버깅
  throw new Error("ORACLE_OLLAMA_HOST environment variable is required");
}

export const llmModel = new ChatGoogle({
  model: "gemma-3-27b-it",
  maxOutputTokens: 2048,
  apiKey: GOOGLE_API_KEY,
});

export const routingModel = new ChatGoogle({
  model: "gemma-3-4b-it",
  maxOutputTokens: 200,
  apiKey: GOOGLE_API_KEY,
  streaming: false,
});
