import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders markdown using our `.prose-donoai` styles from globals.css.
// Server component — react-markdown supports SSR.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-donoai">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
