import React from "react";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Award, 
  Zap, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

interface CustomMarkdownProps {
  content: string;
}

export function CustomMarkdown({ content }: CustomMarkdownProps) {
  // Custom components object for react-markdown
  const components = {
    h3: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);
      
      // 1. Strengths
      if (text.includes("Strengths")) {
        return (
          <div className="my-6 p-4 bg-emerald-50/50 border-2 border-emerald-500 rounded-xl shadow-[4px_4px_0px_#10b981] flex items-start gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg border-2 border-sketch-black">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-sketch text-xl text-emerald-800 font-bold uppercase tracking-wide">
                {text.replace(/^[^\w]*/, "")}
              </h3>
              <p className="text-xs text-emerald-600/80 font-mono mt-0.5">Where you excel on the battlefield</p>
            </div>
          </div>
        );
      }
      
      // 2. Areas for Improvement
      if (text.includes("Improvement") || text.includes("Weak")) {
        return (
          <div className="my-6 p-4 bg-amber-50/50 border-2 border-amber-500 rounded-xl shadow-[4px_4px_0px_#f59e0b] flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg border-2 border-sketch-black">
              <Target size={20} />
            </div>
            <div>
              <h3 className="font-sketch text-xl text-amber-800 font-bold uppercase tracking-wide">
                {text.replace(/^[^\w]*/, "")}
              </h3>
              <p className="text-xs text-amber-600/80 font-mono mt-0.5">High-impact topics for practice</p>
            </div>
          </div>
        );
      }
      
      // 3. Actionable Study Plan / Roadmap
      if (text.includes("Plan") || text.includes("Roadmap")) {
        return (
          <div className="my-6 p-4 bg-blue-50/50 border-2 border-blue-500 rounded-xl shadow-[4px_4px_0px_#3b82f6] flex items-start gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg border-2 border-sketch-black">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-sketch text-xl text-blue-800 font-bold uppercase tracking-wide">
                {text.replace(/^[^\w]*/, "")}
              </h3>
              <p className="text-xs text-blue-600/80 font-mono mt-0.5">Step-by-step preparation path</p>
            </div>
          </div>
        );
      }

      // Default H3
      return (
        <h3 className="font-sketch text-2xl text-blueprint-blue font-bold my-4 uppercase tracking-wide border-b-2 border-dashed border-blueprint-blue/20 pb-1" {...props}>
          {children}
        </h3>
      );
    },

    p: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);
      
      // Check if it's a step
      const stepMatch = text.match(/^Steps?\s+(\d+):\s*(.*?)(?:\s*\((Days?\s*\d+[-–]\d+)\))?$/i);
      
      if (stepMatch) {
        const stepNum = stepMatch[1];
        const stepTitle = stepMatch[2];
        const duration = stepMatch[3];
        
        return (
          <div className="my-6 p-5 bg-white border-2 border-sketch-black shadow-[4px_4px_0px_#171717] rounded-xl flex flex-col gap-3 relative overflow-hidden group hover:shadow-[6px_6px_0px_#171717] transition-all">
            {/* Step Index Badge */}
            <div className="flex items-center justify-between border-b border-dashed border-sketch-black/10 pb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blueprint-blue text-white text-xs font-bold font-mono border-2 border-sketch-black rounded-lg">
                STEP {stepNum.padStart(2, "0")}
              </span>
              {duration && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-sketch-black/60 font-mono">
                  <Calendar size={14} className="text-blueprint-blue" />
                  {duration}
                </span>
              )}
            </div>
            
            <h4 className="font-sketch text-lg text-sketch-black font-bold group-hover:text-blueprint-blue transition-colors">
              {stepTitle}
            </h4>
          </div>
        );
      }

      // Check if it's focus, goal or execution in single paragraph
      const badgeMatch = text.match(/^(Focus|Goal|Execution):\s*(.*)$/i);
      if (badgeMatch) {
        const type = badgeMatch[1].toLowerCase();
        const contentVal = badgeMatch[2];
        return renderBadgeRow(type, contentVal);
      }

      // Default paragraph
      return (
        <p className="my-3 font-mono text-sm leading-relaxed text-sketch-black/80" {...props}>
          {children}
        </p>
      );
    },

    li: ({ children, ...props }: any) => {
      const text = getTextFromChildren(children);

      // Check if it's a step inside a list item
      const stepMatch = text.match(/^Steps?\s+(\d+):\s*(.*?)(?:\s*\((Days?\s*\d+[-–]\d+)\))?$/i);
      if (stepMatch) {
        const stepNum = stepMatch[1];
        const stepTitle = stepMatch[2];
        const duration = stepMatch[3];
        
        return (
          <div className="my-6 p-5 bg-white border-2 border-sketch-black shadow-[4px_4px_0px_#171717] rounded-xl flex flex-col gap-3 relative overflow-hidden group hover:shadow-[6px_6px_0px_#171717] transition-all">
            <div className="flex items-center justify-between border-b border-dashed border-sketch-black/10 pb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blueprint-blue text-white text-xs font-bold font-mono border-2 border-sketch-black rounded-lg">
                STEP {stepNum.padStart(2, "0")}
              </span>
              {duration && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-sketch-black/60 font-mono">
                  <Calendar size={14} className="text-blueprint-blue" />
                  {duration}
                </span>
              )}
            </div>
            <h4 className="font-sketch text-lg text-sketch-black font-bold group-hover:text-blueprint-blue transition-colors">
              {stepTitle}
            </h4>
          </div>
        );
      }

      // Check for prefix badges (Focus, Goal, Execution)
      const badgeMatch = text.match(/^(Focus|Goal|Execution):\s*(.*)$/i);
      if (badgeMatch) {
        const type = badgeMatch[1].toLowerCase();
        const contentVal = badgeMatch[2];
        return renderBadgeRow(type, contentVal);
      }

      // Default bullet items
      return (
        <li className="my-1.5 pl-6 relative font-mono text-sm leading-relaxed text-sketch-black/80 list-none" {...props}>
          <span className="absolute left-1.5 top-2.5 w-1.5 h-1.5 bg-blueprint-blue rounded-full"></span>
          {children}
        </li>
      );
    },

    strong: ({ children, ...props }: any) => {
      return (
        <strong className="font-bold text-sketch-black bg-yellow-100 px-1 border border-yellow-200 rounded font-mono" {...props}>
          {children}
        </strong>
      );
    },

    code: ({ node, inline, className, children, ...props }: any) => {
      return (
        <code className="px-1.5 py-0.5 bg-slate-100 text-pink-600 rounded border border-slate-200 font-mono text-xs font-bold" {...props}>
          {children}
        </code>
      );
    }
  };

  // Helper to extract text from nested react elements
  function getTextFromChildren(children: any): string {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) return children.map(getTextFromChildren).join("");
    if (children && children.props && children.props.children) {
      return getTextFromChildren(children.props.children);
    }
    return "";
  }

  // Render styled rows for Focus, Goal, Execution
  function renderBadgeRow(type: string, content: string) {
    let badgeBg = "bg-blue-100 text-blue-800 border-blue-300";
    let badgeText = "🔍 Focus";
    let iconColor = "text-blue-500";
    
    if (type === "goal") {
      badgeBg = "bg-purple-100 text-purple-800 border-purple-300";
      badgeText = "🎯 Goal";
      iconColor = "text-purple-500";
    } else if (type === "execution") {
      badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
      badgeText = "⚡ Execution";
      iconColor = "text-emerald-500";
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 my-2 py-1.5 px-3 border border-sketch-black/5 bg-slate-50/50 rounded-lg font-mono">
        <div className={`w-28 shrink-0 flex items-center justify-center py-0.5 text-xs font-bold uppercase rounded border-2 border-sketch-black ${badgeBg}`}>
          {badgeText}
        </div>
        <div className="text-sm text-sketch-black/80 flex-1 pl-1">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
