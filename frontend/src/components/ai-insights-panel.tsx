import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Brain, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AiInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  content: string | null;
  error: string | null;
}

export function AiInsightsPanel({ isOpen, onClose, loading, content, error }: AiInsightsPanelProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white w-full max-w-2xl max-h-[85vh] border-2 border-sketch-black shadow-[8px_8px_0px_#171717] flex flex-col relative overflow-hidden">
          
          {/* Header */}
          <div className="bg-blueprint-blue text-white p-4 flex items-center justify-between border-b-2 border-sketch-black sticky top-0 z-10">
            <div className="flex items-center gap-2 font-sketch text-2xl">
              <Sparkles size={24} />
              AI Topic Insights
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto bg-paper flex-1 font-mono text-sm leading-relaxed custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-sketch-black/60 gap-4">
                <Loader2 size={48} className="animate-spin text-blueprint-blue" />
                <p className="font-bold text-lg animate-pulse">Analyzing your coding patterns...</p>
                <p className="text-xs">Generating your personalized roadmap</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-500 p-6 text-center text-red-700 shadow-[4px_4px_0px_#ef4444]">
                <p className="font-bold mb-2">Analysis Failed</p>
                <p>{error}</p>
                <button 
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-red-600 text-white font-bold hover:-translate-y-0.5 transition-transform border-2 border-sketch-black shadow-[2px_2px_0px_#171717]"
                >
                  Close
                </button>
              </div>
            ) : content ? (
              <div className="prose prose-sm max-w-none prose-headings:font-sketch prose-headings:text-blueprint-blue prose-h3:text-2xl prose-a:text-blueprint-blue prose-a:font-bold prose-strong:text-sketch-black">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-10 text-sketch-black/50">
                <Brain size={48} className="mx-auto mb-4 opacity-50" />
                <p>No analysis generated yet.</p>
              </div>
            )}
          </div>
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
