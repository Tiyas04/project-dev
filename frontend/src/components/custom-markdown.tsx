import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Award, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  AlertTriangle,
  Code2,
  Clock,
  Layers,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface CustomMarkdownProps {
  content: string;
}

export function CustomMarkdown({ content }: CustomMarkdownProps) {
  // Helper to extract plain text string from nested React children
  function getTextFromChildren(children: any): string {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) return children.map(getTextFromChildren).join("");
    if (children && children.props && children.props.children) {
      return getTextFromChildren(children.props.children);
    }
    return "";
  }

  // Detect and format CP directive badge prefixes (Mechanism, Objective, Pattern, Focus, Execution, Trap)
  function renderDirectiveBadge(text: string) {
    const directiveMatch = text.match(/^(Mechanism|Objective|Pattern|Focus|Goal|Execution|Trap|Antipattern|Complexity):\s*(.*)$/i);
    if (!directiveMatch) return null;

    const key = directiveMatch[1].toLowerCase();
    const rest = directiveMatch[2];

    const configs: Record<string, { label: string; icon: string; classes: string }> = {
      mechanism: {
        label: "Mechanism",
        icon: "⚙️",
        classes: "bg-purple-50 text-purple-700 border-purple-200"
      },
      objective: {
        label: "Objective",
        icon: "🎯",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200"
      },
      pattern: {
        label: "Pattern",
        icon: "🧩",
        classes: "bg-blue-50 text-blueprint-blue border-blue-200"
      },
      focus: {
        label: "Focus",
        icon: "🔍",
        classes: "bg-sky-50 text-sky-700 border-sky-200"
      },
      goal: {
        label: "Goal",
        icon: "🏁",
        classes: "bg-indigo-50 text-indigo-700 border-indigo-200"
      },
      execution: {
        label: "Execution",
        icon: "⚡",
        classes: "bg-emerald-50 text-emerald-800 border-emerald-300"
      },
      trap: {
        label: "Trap",
        icon: "⚠️",
        classes: "bg-rose-50 text-rose-700 border-rose-200"
      },
      antipattern: {
        label: "Antipattern",
        icon: "🚫",
        classes: "bg-red-50 text-red-700 border-red-200"
      },
      complexity: {
        label: "Complexity",
        icon: "⏱️",
        classes: "bg-amber-50 text-amber-800 border-amber-200"
      }
    };

    const cfg = configs[key] || { label: directiveMatch[1], icon: "📌", classes: "bg-slate-100 text-slate-700 border-slate-200" };

    return (
      <span className="inline-flex items-center gap-1.5 font-bold font-mono text-[11px] px-2 py-0.5 rounded border mr-2 align-middle shadow-xs uppercase tracking-wider select-none shrink-0">
        <span className="text-[10px]">{cfg.icon}</span>
        <span>{cfg.label}</span>
      </span>
    );
  }

  const components = {
    // Top-Level Section Headers
    h2: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);
      return (
        <div className="my-6 pb-2.5 border-b-2 border-slate-200 flex items-center gap-2.5">
          <Layers className="text-blueprint-blue shrink-0" size={22} />
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight" {...props}>
            {children}
          </h2>
        </div>
      );
    },

    // Major Roadmap / Milestone Headers (e.g. Week 1, Strengths, Action Plan)
    h3: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);

      // 1. Weekly Roadmap Milestone Header (e.g., "📅 Week 1: Pattern Recognition & Fundamentals")
      const weekMatch = text.match(/Week\s*(\d+):\s*(.*)/i);
      if (weekMatch) {
        const weekNum = weekMatch[1];
        const weekTitle = weekMatch[2].replace(/^[^\w]*/, "");
        return (
          <div className="my-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border-2 border-blueprint-blue/30 rounded-xl shadow-[4px_4px_0px_#1E3A8A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blueprint-blue text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0">
                W{weekNum.padStart(2, "0")}
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-blueprint-blue bg-blue-100/70 px-2 py-0.5 rounded">
                  Milestone Phase
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
                  {weekTitle}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-medium pl-1 sm:pl-0">
              <Calendar size={14} className="text-blueprint-blue" />
              <span>Week {weekNum} Roadmap</span>
            </div>
          </div>
        );
      }

      // 2. Strengths Card
      if (text.includes("Strengths")) {
        return (
          <div className="my-6 p-4 bg-emerald-50/70 border-2 border-emerald-500 rounded-xl shadow-[4px_4px_0px_#10b981] flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-900 tracking-tight">
                {text.replace(/^[^\w]*/, "")}
              </h3>
              <p className="text-xs text-emerald-700/80 font-mono mt-0.5">Where your algorithmic intuition excels</p>
            </div>
          </div>
        );
      }
      
      // 3. Areas for Improvement / Weaknesses
      if (text.includes("Improvement") || text.includes("Weak") || text.includes("Traps")) {
        return (
          <div className="my-6 p-4 bg-amber-50/70 border-2 border-amber-500 rounded-xl shadow-[4px_4px_0px_#f59e0b] flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-900 tracking-tight">
                {text.replace(/^[^\w]*/, "")}
              </h3>
              <p className="text-xs text-amber-700/80 font-mono mt-0.5">High-impact topics and antipatterns to eliminate</p>
            </div>
          </div>
        );
      }

      // 4. Default H3
      return (
        <div className="my-5 pb-2 border-b border-dashed border-slate-300">
          <h3 className="font-bold text-lg text-blueprint-blue flex items-center gap-2" {...props}>
            <Sparkles size={18} className="text-blueprint-blue shrink-0" />
            {children}
          </h3>
        </div>
      );
    },

    // Category & Sub-section Headers (e.g. Core Patterns, Practice Module, Daily Schedule)
    h4: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);

      let Icon = BookOpen;
      let badgeStyle = "text-slate-700 bg-slate-100 border-slate-200";

      if (text.toLowerCase().includes("pattern")) {
        Icon = Zap;
        badgeStyle = "text-blueprint-blue bg-blue-50 border-blue-200";
      } else if (text.toLowerCase().includes("practice") || text.toLowerCase().includes("problem")) {
        Icon = Target;
        badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
      } else if (text.toLowerCase().includes("schedule") || text.toLowerCase().includes("milestone") || text.toLowerCase().includes("daily")) {
        Icon = Clock;
        badgeStyle = "text-indigo-700 bg-indigo-50 border-indigo-200";
      } else if (text.toLowerCase().includes("trap") || text.toLowerCase().includes("avoid")) {
        Icon = AlertTriangle;
        badgeStyle = "text-rose-700 bg-rose-50 border-rose-200";
      }

      return (
        <div className="mt-6 mb-3 flex items-center gap-2">
          <div className={`p-1 rounded border ${badgeStyle} shrink-0`}>
            <Icon size={15} />
          </div>
          <h4 className="font-bold text-sm sm:text-base text-slate-800 tracking-wide uppercase font-mono" {...props}>
            {children}
          </h4>
        </div>
      );
    },

    // Paragraphs
    p: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);

      // Check if it's an Execution / Actionable callout box
      const executionMatch = text.match(/^(?:⚡\s*)?Execution:\s*(.*)$/i);
      if (executionMatch) {
        return (
          <div className="my-3.5 p-3.5 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-white border border-emerald-200/90 rounded-xl shadow-xs flex items-start gap-3">
            <div className="p-1.5 bg-emerald-600 text-white rounded-md shrink-0 mt-0.5 shadow-xs">
              <Zap size={14} />
            </div>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
              <span className="font-bold font-mono text-emerald-800 uppercase tracking-wide mr-2 text-[11px]">
                Implementation Strategy:
              </span>
              {executionMatch[1]}
            </div>
          </div>
        );
      }

      // Check if it's a Focus / Goal badge row
      const badgeMatch = text.match(/^(Focus|Goal|Mechanism|Objective|Trap):\s*(.*)$/i);
      if (badgeMatch) {
        const badge = renderDirectiveBadge(text);
        return (
          <div className="my-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
            {badge}
            <span className="align-middle">{badgeMatch[2]}</span>
          </div>
        );
      }

      return (
        <p className="my-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 font-sans" {...props}>
          {children}
        </p>
      );
    },

    // Unordered & Ordered Lists
    ul: ({ children, ...props }: any) => (
      <ul className="my-2.5 space-y-2 pl-1 list-none font-sans" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }: any) => (
      <ol className="my-2.5 space-y-2 pl-4 list-decimal font-sans text-xs sm:text-sm text-slate-700" {...props}>
        {children}
      </ol>
    ),

    // List Items
    li: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);

      // 1. Check if the list item is an execution directive
      const executionMatch = text.match(/^(?:⚡\s*)?Execution:\s*(.*)$/i);
      if (executionMatch) {
        return (
          <li className="my-2 list-none">
            <div className="p-3 bg-gradient-to-r from-emerald-50/60 to-white border border-emerald-200/80 rounded-lg shadow-xs flex items-start gap-2.5">
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded uppercase tracking-wider shrink-0 mt-0.5">
                EXECUTION
              </span>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans flex-1">
                {executionMatch[1]}
              </div>
            </div>
          </li>
        );
      }

      // 2. Check for directive prefix (Mechanism, Objective, Pattern, Focus, Trap)
      const directiveMatch = text.match(/^(Mechanism|Objective|Pattern|Focus|Goal|Trap|Complexity):\s*(.*)$/i);
      if (directiveMatch) {
        const badge = renderDirectiveBadge(text);
        return (
          <li className="my-2 pl-5 relative list-none text-xs sm:text-sm text-slate-700 leading-relaxed font-sans" {...props}>
            <span className="absolute left-1 top-2.5 w-1.5 h-1.5 rounded-full bg-blueprint-blue/60"></span>
            <div className="flex flex-wrap items-baseline gap-1">
              {badge}
              <span className="flex-1">{directiveMatch[2]}</span>
            </div>
          </li>
        );
      }

      // Default bullet list item
      return (
        <li className="my-1.5 pl-5 relative list-none text-xs sm:text-sm text-slate-700 leading-relaxed font-sans" {...props}>
          <span className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-blueprint-blue/70"></span>
          {children}
        </li>
      );
    },

    // Bold text (replaces the harsh yellow box with contextual pill badges or clean bold styling)
    strong: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);

      // Check if it's a LeetCode problem badge
      if (text.includes("[LeetCode]")) {
        const ratingMatch = text.match(/Rating:\s*(\d+)/i);
        const title = text.replace(/\[LeetCode\]/i, "").replace(/\(Rating:.*?\)/i, "").trim();
        return (
          <span className="inline-flex flex-wrap items-center gap-1.5 font-sans font-semibold text-slate-900 my-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
              LeetCode
            </span>
            <span className="hover:text-blueprint-blue transition-colors">{title}</span>
            {ratingMatch && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ★ {ratingMatch[1]}
              </span>
            )}
          </span>
        );
      }

      // Check if it's a Codeforces problem badge
      if (text.includes("[Codeforces]")) {
        const ratingMatch = text.match(/Rating:\s*(\d+)/i);
        const title = text.replace(/\[Codeforces\]/i, "").replace(/\(Rating:.*?\)/i, "").trim();
        return (
          <span className="inline-flex flex-wrap items-center gap-1.5 font-sans font-semibold text-slate-900 my-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-300 shadow-2xs">
              Codeforces
            </span>
            <span className="hover:text-blueprint-blue transition-colors">{title}</span>
            {ratingMatch && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ★ {ratingMatch[1]}
              </span>
            )}
          </span>
        );
      }

      // Check if it's a schedule milestone tag (e.g. Days 1-3:)
      if (text.match(/^Days?\s*\d+/i)) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-mono font-bold text-xs mr-1.5 shadow-2xs">
            <Clock size={11} className="text-indigo-600" />
            {text}
          </span>
        );
      }

      // Clean, professional bold text
      return (
        <strong className="font-bold text-slate-900" {...props}>
          {children}
        </strong>
      );
    },

    // Code & Code Blocks
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline || !className) {
        return (
          <code className="px-1.5 py-0.5 bg-slate-100 text-blueprint-blue rounded border border-slate-200/90 font-mono text-[12px] font-semibold" {...props}>
            {children}
          </code>
        );
      }
      return (
        <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-sm">
          <div className="px-3 py-1.5 bg-slate-800/80 border-b border-slate-700 text-slate-400 font-mono text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Code2 size={12} className="text-blueprint-blue" />
              Code Snippet
            </span>
          </div>
          <pre className="p-3.5 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
            <code {...props}>{children}</code>
          </pre>
        </div>
      );
    },

    // Blockquote
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="my-3 border-l-4 border-blueprint-blue bg-blue-50/40 px-4 py-2 rounded-r-lg text-xs sm:text-sm text-slate-700 italic font-sans" {...props}>
        {children}
      </blockquote>
    ),

    // Tables
    table: ({ children, ...props }: any) => (
      <div className="my-4 overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
        <table className="w-full text-left text-xs sm:text-sm border-collapse font-sans" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-xs font-bold text-slate-700" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }: any) => (
      <th className="py-2.5 px-3.5 font-bold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="py-2 px-3.5 border-b border-slate-100 text-slate-700" {...props}>
        {children}
      </td>
    )
  };

  return (
    <div className="custom-markdown-root font-sans text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
