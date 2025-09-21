import { AIMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "../graph-builder";

// Google Custom Search API 응답 타입
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
}

export async function googleSearchNode(
  state: typeof FlowStateAnnotation.State,
): Promise<Partial<typeof state>> {
  console.log("Executing Google search node");

  try {
    // 검색 쿼리 추출 (마지막 메시지 혹은 프롬프트)
    const searchQuery =
      state.prompt ||
      (state.messages[state.messages.length - 1]?.content as string) ||
      "";

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY!;
    const searchEngineId = process.env.GOOGLE_SEARCH_CX!;

    if (!apiKey || !searchEngineId) {
      throw new Error("Google Search API credentials not configured");
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl);
    const data: GoogleSearchResponse = await response.json();

    const searchResults =
      data.items?.slice(0, 5).map((item: GoogleSearchItem) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      })) || [];

    // 검색 결과를 요약한 메시지 생성
    const resultMessage = new AIMessage(
      `검색 결과 (${searchResults.length}개):\n\n` +
        searchResults
          .map(
            (result: GoogleSearchItem, index: number) =>
              `${index + 1}. ${result.title}\n${result.snippet}\n${result.link}\n`,
          )
          .join("\n"),
    );

    console.log(resultMessage);
    return {
      messages: [resultMessage],
      searchResults,
      nodeOutputs: {
        ...state.nodeOutputs,
        google_search: {
          query: searchQuery,
          results: searchResults,
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Google search node error:", error);

    const errorMessage = new AIMessage(
      `구글 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
    );

    return {
      messages: [errorMessage],
      searchResults: [],
      nodeOutputs: {
        ...state.nodeOutputs,
        google_search: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
}
