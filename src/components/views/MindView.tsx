/**
 * Project EON - EON MIND Conversational Intelligence View
 * Cognitive preference modeling, decision rationale, grounded memory recall,
 * and user-approved learning workflows.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Database,
  CheckCircle,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
  PlusCircle,
} from 'lucide-react';
import { MemoryNode } from '../../core/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  activatedMemories?: MemoryNode[];
  proposedMemories?: Array<Omit<MemoryNode, 'id' | 'createdAt' | 'updatedAt'>>;
}

interface MindViewProps {
  onMemoryCreated: (memory: MemoryNode) => void;
}

export const MindView: React.FC<MindViewProps> = ({ onMemoryCreated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      role: 'assistant',
      text: 'EON MIND Cognitive Engine online. Grounded in persistent episodic, semantic, preference, decision, and correction memory. How may I assist your research or codebase analysis today?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvedProposalIds, setApprovedProposalIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/mind/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: data.text || 'No response returned from cognitive engine.',
        timestamp: new Date().toLocaleTimeString(),
        activatedMemories: data.activatedMemories || [],
        proposedMemories: data.proposedMemories || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          text: `Cognitive Engine encountered error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLearning = async (
    proposal: Omit<MemoryNode, 'id' | 'createdAt' | 'updatedAt'>,
    index: number
  ) => {
    try {
      const res = await fetch('/api/memory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...proposal,
          approved: true,
          provenance: 'user_approved_learning',
        }),
      });
      const saved = await res.json();
      onMemoryCreated(saved);
      setApprovedProposalIds((prev) => ({ ...prev, [`${proposal.title}-${index}`]: true }));
    } catch (e) {
      console.error('Failed to approve memory:', e);
    }
  };

  const promptChips = [
    'Analyze codebase vulnerabilities and propose AST improvements',
    'Review cognitive preferences regarding isolated sandboxes',
    'Formulate research hypothesis on vector retrieval latency',
    'Inspect decision history regarding anti-self-approval mechanisms',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Left 3 Cols: Chat & Interaction Console */}
      <div className="lg:col-span-3 flex flex-col rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-lg">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-slate-200">EON MIND // COGNITIVE STREAM</span>
            <span className="font-mono text-[10px] text-violet-400 bg-violet-950/60 border border-violet-800/40 px-1.5 py-0.5 rounded">
              SEMANTIC GROUNDING ACTIVE
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Gemini 2.5 Flash / Server-Side Proxy</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {msg.role === 'user' ? 'Owner (Vibhagupta)' : 'EON Mind'}
                </span>
                <span className="text-[10px] text-slate-600">•</span>
                <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/30'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounded Memory Badges */}
                {msg.activatedMemories && msg.activatedMemories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1 text-[10px] font-mono text-violet-400 mb-1.5">
                      <Database className="w-3 h-3" />
                      <span>GROUNDED IN {msg.activatedMemories.length} MEMORIES:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.activatedMemories.map((m) => (
                        <span
                          key={m.id}
                          className="text-[10px] font-mono bg-violet-950/70 border border-violet-800/50 text-violet-300 px-2 py-0.5 rounded"
                          title={m.content}
                        >
                          [{m.category}] {m.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* User-Approved Learning Proposal Queue */}
                {msg.proposedMemories && msg.proposedMemories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-violet-900/40 bg-violet-950/30 p-2.5 rounded-lg border border-violet-800/30">
                    <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-violet-300 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Proposed Cognitive Learnings (Requires Owner Approval):</span>
                    </div>
                    <div className="space-y-2">
                      {msg.proposedMemories.map((prop, idx) => {
                        const isApproved = approvedProposalIds[`${prop.title}-${idx}`];
                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between bg-slate-900/90 p-2 rounded border border-slate-800 text-[11px]"
                          >
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono text-[9px] uppercase px-1 rounded bg-violet-950 text-violet-300 border border-violet-800/60">
                                  {prop.category}
                                </span>
                                <span className="font-medium text-slate-200">{prop.title}</span>
                              </div>
                              <p className="text-slate-400 mt-0.5">{prop.content}</p>
                            </div>
                            <button
                              disabled={isApproved}
                              onClick={() => handleApproveLearning(prop, idx)}
                              className={`shrink-0 ml-3 px-2 py-1 text-[10px] font-medium rounded flex items-center space-x-1 transition-colors ${
                                isApproved
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-violet-600 hover:bg-violet-500 text-white'
                              }`}
                            >
                              {isApproved ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Learned</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-3 h-3" />
                                  <span>Approve</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span>EON Mind analyzing semantic memory &amp; formulating reasoning...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Suggestion Chips */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
          {/* Suggestion Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query EON Mind or instruct on cognitive preference..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              disabled={loading}
              aria-label="Cognitive message input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm shadow-violet-900/50"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 1 Col: Cognitive Profile & Invariants Inspector */}
      <div className="space-y-4 overflow-y-auto">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Info className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-semibold text-white">Cognitive Invariants</h3>
          </div>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="font-mono text-[10px] text-violet-400 uppercase">Single-Owner Mind</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Model aligns cognitive preferences exclusively with vibhagupta13572@gmail.com.
              </p>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="font-mono text-[10px] text-violet-400 uppercase">Anti-Hallucination</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every code mutation requires AST diff generation, isolated testing, and human token sign-off.
              </p>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="font-mono text-[10px] text-violet-400 uppercase">User-Approved Learning</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inferred rules stay in proposed status until explicitly authorized by the owner.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-white">Decision History</h3>
          </div>
          <div className="mt-3 space-y-2 text-[11px] text-slate-400">
            <p>• Enforced isolated Node VM evaluation for all test cases.</p>
            <p>• Chained audit logs with SHA-256 for cryptographic non-repudiation.</p>
            <p>• Decoupled AST patch proposals from self-approval execution gates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
