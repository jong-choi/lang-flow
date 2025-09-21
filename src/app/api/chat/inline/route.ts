import { NextRequest, NextResponse } from "next/server";
import { MessageContent } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llmModel } from "@/app/api/chat/_controllers/utils/model";

// 간단한 체인: 사용자 프롬프트와 선택된 마크다운을 받아 개선된 마크다운을 반환
// - 필요 시 System 프롬프트/가이드라인을 강화 가능
const systemTemplate = `You are an assistant that edits markdown inline.
Follow the user's instruction and return only the edited markdown without extra commentary. Use rich markdown syntax`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, selectionMarkdown } = await request.json();
    if (typeof prompt !== "string" || typeof selectionMarkdown !== "string") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      [
        "user",
        "Instruction: {prompt}\n\nSelected Markdown:\n{selectionMarkdown}\n\nReturn only the edited markdown.",
      ],
    ]);

    const chain = promptTemplate.pipe(llmModel);
    const result = await chain.invoke({ prompt, selectionMarkdown });
    const content = result.content;

    const toText = (content: MessageContent): string => {
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .map((complex) => {
            if (typeof complex === "string") return complex;
            if (complex && typeof complex === "object" && "text" in complex) {
              const textVal = complex.text;
              return typeof textVal === "string" ? textVal : "";
            }
            return "";
          })
          .join("");
      }
      return String(content ?? "");
    };

    const text = toText(content).trim();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("/api/chat/inline error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
