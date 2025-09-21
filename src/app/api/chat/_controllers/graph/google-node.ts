import { z } from "zod";
import { SystemMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import type { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/app/api/chat/_controllers/types/chat";

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX!;
const MEX_RESULTS_LEN = 10;
const ItemSchema = z.object({
  title: z.string(),
  snippet: z.string().optional(),
});

const ItemArraySchema = z.array(ItemSchema);

type Item = z.infer<typeof ItemSchema>;
type State = typeof SessionMessagesAnnotation.State;
type NextState = Partial<State>;

export async function googleNode(state: State) {
  if (state.routingQuery === null) {
    return {
      routeType: "chat" as const,
    };
  }

  let nextState: NextState = {
    routingQuery: null,
  };
  const allItems: Array<Item> = [];

  // 단일 검색어 또는 다중 검색어 처리
  const queries = Array.isArray(state.routingQuery)
    ? state.routingQuery
    : [state.routingQuery];

  const limitPerQuery = Math.ceil(MEX_RESULTS_LEN / queries.length);

  // 각 검색어로 검색 수행
  for (const query of queries) {
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CX,
      q: query,
      num: String(limitPerQuery),
      fields: "items(title,snippet),searchInformation(totalResults)",
    });
    const url = `https://www.googleapis.com/customsearch/v1?${params}`;

    try {
      const res: Response = await fetch(url);

      if (!res.ok) {
        console.error(
          "Google API response not ok:",
          res.status,
          res.statusText,
        );
        console.log(res);
        continue;
      }

      const data = await res.json();

      let items: Array<Item>;
      try {
        items = ItemArraySchema.parse(data.items);
        allItems.push(...items);
      } catch (error) {
        console.error("Failed to parse Google search results:", error);
        continue;
      }
    } catch (error) {
      console.error("Google search error for query:", query, error);
      continue;
    }
  }

  if (allItems.length === 0) {
    nextState = {
      ...nextState,
      messages: [new SystemMessage("일시적인 오류로 검색에 실패하였습니다.")],
      routeType: "chat",
    };
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }

  nextState = {
    ...nextState,
    messages: [new SystemMessage(JSON.stringify(allItems))],
    routeType: "chat",
  };

  return new Command({
    goto: LangNodeName.routing,
    update: nextState,
  });
}
