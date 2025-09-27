import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

export function ReactMarkdownApp({ children }: { children?: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}>
      {children}
    </ReactMarkdown>
  );
}
