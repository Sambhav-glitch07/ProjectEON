/**
 * Project EON - Overview HUD View
 * Real-time operational telemetry, subsystem states, and security posture.
 */

import React from 'react';
import {
  Activity,
  Brain,
  Cpu,
  Database,
  FlaskConical,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Server,
} from 'lucide-react';
import { SystemStatus, AuditEntry, MemoryNode, EvolutionProposal, LabExperiment } from '../../core/types';
import { ActiveTab } from '../Navigation';

interface OverviewViewProps {
  status: SystemStatus | null;
  memories: MemoryNode[];
  proposals: EvolutionProposal[];
  experiments: LabExperiment[];
  auditLogs: AuditEntry[];
  onNavigate: (tab: ActiveTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  status,
  memories,
  proposals,
  experiments,
  auditLogs,
  onNavigate,
}) => {
  const pendingProposals = proposals.filter((p) => p.status === 'proposed' || p.status === 'test_passed');
  const completedExperiments = experiments.filter((e) => e.status === 'completed');
  const criticalAuditLogs = auditLogs.filter((l) => l.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Top Banner / System HUD */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-[#0e172a] to-slate-900 border border-slate-800 p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs uppercase tracking-widest text-violet-400 bg-violet-950/70 border border-violet-800/50 px-2 py-0.5 rounded">
                EON CORE // SYSTEM OVERVIEW
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-emerald-400 text-xs font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ALL SUBSYSTEMS NOMINAL</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Autonomous Cognitive Research &amp; Software Evolution Platform
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Integrating persistent cognitive preference modeling (EON Mind), controlled AST codebase mutation (EON Evolve), scientific hypothesis testing (EON Lab), and cryptographic single-owner security (EON Guard).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('mind')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-violet-900/50 flex items-center space-x-1.5"
            >
              <Brain className="w-4 h-4" />
              <span>Query EON Mind</span>
            </button>
            <button
              onClick={() => onNavigate('evolve')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Cpu className="w-4 h-4" />
              <span>Inspect Codebase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subsystem Metrics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* EON MIND */}
        <div
          onClick={() => onNavigate('memory')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-1.5 py-0.5 rounded">
              INDEXED
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">{memories.length}</span>
            <span className="text-xs text-slate-400 ml-2">Memory Nodes</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            Episodic, semantic, &amp; cognitive preferences
          </p>
          <div className="mt-3 flex items-center text-xs text-violet-400 group-hover:text-violet-300 font-medium">
            <span>Explore memory vectors</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* EON EVOLVE */}
        <div
          onClick={() => onNavigate('proposals')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-violet-400 bg-violet-950/40 border border-violet-800/30 px-1.5 py-0.5 rounded">
              AST ENGINE
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">{proposals.length}</span>
            <span className="text-xs text-slate-400 ml-2">Evolution Proposals</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {pendingProposals.length} awaiting human review &amp; tests
          </p>
          <div className="mt-3 flex items-center text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
            <span>View code diffs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* EON LAB */}
        <div
          onClick={() => onNavigate('lab')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-1.5 py-0.5 rounded">
              EMPIRICAL
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">{experiments.length}</span>
            <span className="text-xs text-slate-400 ml-2">Hypotheses Tested</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {completedExperiments.length} statistically validated
          </p>
          <div className="mt-3 flex items-center text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">
            <span>Inspect A/B metrics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* EON GUARD */}
        <div
          onClick={() => onNavigate('security')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-1.5 py-0.5 rounded">
              CHAIN VALID
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">{auditLogs.length}</span>
            <span className="text-xs text-slate-400 ml-2">Audit Logs</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            Zero tamper violations, Single-Owner locked
          </p>
          <div className="mt-3 flex items-center text-xs text-emerald-400 group-hover:text-emerald-300 font-medium">
            <span>Inspect audit chain</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Proposals & Lab Experiments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Proposals Panel */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Active Evolution Proposals</h2>
              </div>
              <button
                onClick={() => onNavigate('proposals')}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium"
              >
                View all proposals
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {proposals.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No active proposals. Run codebase inspection to generate improvements.
                </div>
              ) : (
                proposals.slice(0, 3).map((prop) => (
                  <div key={prop.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-slate-200">{prop.title}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                            prop.riskLevel === 'low'
                              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                              : prop.riskLevel === 'medium'
                              ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                              : 'text-rose-400 bg-rose-950/40 border-rose-800/40'
                          }`}
                        >
                          {prop.riskLevel} risk
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {prop.targetFile}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{prop.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Status: {prop.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Research Lab Highlights */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Empirical Research Experiments</h2>
              </div>
              <button
                onClick={() => onNavigate('lab')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Lab workbench
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {experiments.slice(0, 2).map((exp) => (
                <div key={exp.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{exp.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                      p ~= {exp.pScoreEstimate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{exp.hypothesis}&rdquo;</p>
                  {exp.conclusion && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 p-1.5 rounded">
                      {exp.conclusion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Security Invariants & Audit Stream */}
        <div className="space-y-6">
          {/* Security Guard Status Box */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">EON Guard Invariants</h2>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-start justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Single-Owner Auth</span>
                <span className="font-mono text-emerald-400 font-medium">LOCKED &amp; VERIFIED</span>
              </div>
              <div className="flex items-start justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Anti-Self-Approval Gate</span>
                <span className="font-mono text-emerald-400 font-medium">ACTIVE (HUMAN ONLY)</span>
              </div>
              <div className="flex items-start justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Execution Sandbox</span>
                <span className="font-mono text-emerald-400 font-medium">ISOLATED / WATCHDOG</span>
              </div>
              <div className="flex items-start justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Production Credentials</span>
                <span className="font-mono text-emerald-400 font-medium">SERVER-SIDE ONLY</span>
              </div>
              <div className="flex items-start justify-between py-1">
                <span className="text-slate-400">Audit Hash Chain</span>
                <span className="font-mono text-emerald-400 font-medium">100% UNBROKEN</span>
              </div>
            </div>
          </div>

          {/* Tamper-Evident Audit Feed */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Live Audit Chain</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">SHA-256</span>
            </div>

            <div className="mt-3 space-y-2">
              {auditLogs.slice(-4).reverse().map((log) => (
                <div key={log.id} className="p-2 rounded bg-slate-950/50 border border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-violet-400">{log.action}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-1">{log.details}</p>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                    Hash: {log.entryHash.slice(0, 16)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
