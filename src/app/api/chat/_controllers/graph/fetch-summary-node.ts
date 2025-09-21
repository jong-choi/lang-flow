import { SystemMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { getAISummaryByPostId } from "@/app/post/fetchers/ai";
import { LangNodeName } from "@/types/chat";
import { SessionMessagesAnnotation } from "./graph";

// 게시글 요약문을 업데이트함
export async function fetchSummaryNode(
  state: typeof SessionMessagesAnnotation.State,
) {
  const nextState: Partial<typeof state> = {
    ...state,
    routeType: "chat",
    postSummary: null,
  };

  const currentPostId = state.postId || null;
  const prevPostId = state.postSummary?.id || null;
  if (!state.postId || currentPostId == prevPostId) {
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }

  try {
    const res = await getAISummaryByPostId(state.postId);
    const data = res.data;
    if (data) {
      const { post_id, summary } = data;
      nextState.postSummary = {
        id: post_id || state.postId,
        summary,
      };
      nextState.messages = [
        new SystemMessage(
          `사용자님께서 현재 보고 있는 게시글에 대한 요약입니다. \n\n ${summary}`,
        ),
      ];
    }

    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  } catch (e) {
    console.error("Fetch summary error:", e); //디버깅
    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  }
}
