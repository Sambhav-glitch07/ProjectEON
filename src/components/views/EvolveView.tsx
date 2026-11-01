/**
 * Project EON - EON EVOLVE Subsystem View
 * Codebase inspection, weakness detection, AST analysis, and improvement proposal generator.
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  FileCode,
  AlertTriangle,
  CheckCircle,
  Play,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { EvolutionProposal } from '../../core/types';

interface InspectedFile {
  path: string;
  lines: number;
  sizeBytes: number;
  complexityScore: number;
  weaknesses: string[];
}

interface EvolveViewProps {
  onProposalCreated: (proposal: EvolutionProposal) => void;
  onNavigateToProposals: () => void;
}

export const EvolveView: React.FC<EvolveViewProps> = ({
  onProposalCreated,
  onNavigateToProposals,
}) => {
  const [files, setFiles] = useState<InspectedFile[]>([]);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('src/core/memory.ts');
  const [customObjective, setCustomObjective] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [latestProposal, setLatestProposal] = useState<EvolutionProposal | null>(null);

  const runInspection = async () => {
    setLoadingInspection(true);
    try {
      const res = await fetch('/api/evolve/inspect');
      const data = await res.json();
      if (Array.isArray(data.files)) {
        setFiles(data.files);
        if (data.files.length > 0 && !selectedFile) {
          setSelectedFile(data.files[0].path);
        }
      }
    } catch (e) {
      console.error('Inspection failed:', e);
    } finally {
      setLoadingInspection(false);
    }
  };

  useEffect(() => {
    runInspection();
  }, []);

  const handleGenerateProposal = async () => {
    if (!selectedFile || generatingProposal) return;
    setGeneratingProposal(true);
    setLatestProposal(null);

    try {
      const res = await fetch('/api/evolve/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFilePath: selectedFile,
          objective: customObjective || 'Optimize algorithmic performance, error boundaries, and type safety.',
        }),
      });

      const proposal: EvolutionProposal = await res.json();
      setLatestProposal(proposal);
      onProposalCreated(proposal);
    } catch (err) {
      console.error('Proposal generation failed:', err);
    } finally {
      setGeneratingProposal(false);
    }
  };

  const totalWeaknesses = files.reduce((acc, f) => acc + f.weaknesses.length, 0);

  return (
    <div className="space-y-6">
      {/* Subsystem Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
              EON EVOLVE // CODE MUTATION ENGINE
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 text-xs font-mono">AST PARSER ACTIVE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Autonomous Codebase Inspection &amp; Evolution Proposals
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Analyzes project architecture for weaknesses, calculates risk scores, and generates patch proposals with deterministic test suites.
          </p>
        </div>

        <button
          onClick={runInspection}
          disabled={loadingInspection}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingInspection ? 'animate-spin' : ''}`} />
          <span>Re-inspect Codebase</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Inspected Files</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{files.length}</div>
          <span className="text-[11px] text-slate-500 font-mono">TypeScript / React modules</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Detected Weaknesses</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{totalWeaknesses}</div>
          <span className="text-[11px] text-slate-500 font-mono">Type safety &amp; error boundary risks</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Human Approval Rule</span>
          <div className="text-sm font-semibold font-mono text-emerald-400 mt-2">MANDATORY SIGN-OFF</div>
          <span className="text-[11px] text-slate-500 font-mono">Zero autonomous self-deployment</span>
        </div>
      </div>

      {/* Two Column Layout: File Inspector & Proposal Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inspected Files Table */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-slate-200">Codebase Inspection Registry</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Click a file to target for evolution</span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[500px]">
            {loadingInspection ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Scanning project source files and AST complexity...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No source files detected.</div>
            ) : (
              files.map((file) => {
                const isSelected = selectedFile === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/30 border-l-2 border-indigo-500'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-medium text-slate-200">{file.path}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{file.lines} lines</span>
                        <span className="text-[10px] text-slate-500 font-mono">({Math.round(file.sizeBytes / 1024)} KB)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Complexity: {file.complexityScore}/100
                        </span>
                        {file.weaknesses.length === 0 ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{file.weaknesses.length} issues</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {file.weaknesses.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {file.weaknesses.map((w, idx) => (
                          <div key={idx} className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Proposal Generator Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-white">Propose Evolution Patch</h3>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-mono">TARGET FILE</label>
                <input
                  type="text"
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-mono">REFACTORING OBJECTIVE</label>
                <textarea
                  value={customObjective}
                  onChange={(e) => setCustomObjective(e.target.value)}
                  placeholder="e.g. Enforce strict error boundaries and optimize vector retrieval..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleGenerateProposal}
                disabled={generatingProposal || !selectedFile}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm shadow-indigo-900/40"
              >
                {generatingProposal ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing &amp; Generating Diff...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Generate Proposal</span>
                  </>
                )}
              </button>

              <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/60 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Governance Note:</span> Generated proposals will automatically compute unified diffs, risk scoring, and test cases, but require owner authorization in the Code Proposals gate.
              </div>
            </div>
          </div>

          {/* Latest Proposal Result Banner */}
          {latestProposal && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300">{latestProposal.title}</span>
                <span className="font-mono text-[10px] uppercase text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                  {latestProposal.riskLevel} risk ({latestProposal.riskScore})
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">{latestProposal.description}</p>
              <button
                onClick={onNavigateToProposals}
                className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded flex items-center justify-center space-x-1"
              >
                <span>Inspect in Code Proposals Gate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
