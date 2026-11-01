/**
 * Project EON - Code Proposals & Human Authorization Gate View
 * Unified diff viewer, risk matrix, isolated sandbox testing,
 * anti-self-approval enforcement, and version rollback registry.
 */

import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ShieldAlert,
  Play,
  RotateCcw,
  Lock,
  FileCode,
  Check,
  Terminal,
} from 'lucide-react';
import { AUTHORIZED_OWNER_EMAIL, EvolutionProposal, VersionSnapshot } from '../../core/types';

interface ProposalsViewProps {
  proposals: EvolutionProposal[];
  snapshots: VersionSnapshot[];
  onProposalUpdated: (proposal: EvolutionProposal) => void;
  onSnapshotCreated: (snapshot: VersionSnapshot) => void;
  onRollbackCompleted: (message: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  proposals,
  snapshots,
  onProposalUpdated,
  onSnapshotCreated,
  onRollbackCompleted,
}) => {
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    proposals[0]?.id || ''
  );
  const [testingProposalId, setTestingProposalId] = useState<string | null>(null);
  const [approvalToken, setApprovalToken] = useState(
    `OWNER_AUTH_SIG_${Date.now()}`
  );
  const [applyingProposalId, setApplyingProposalId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId) || proposals[0];

  const handleRunTests = async (proposalId: string) => {
    setTestingProposalId(proposalId);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/evolve/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (data.proposal) {
        onProposalUpdated(data.proposal);
        setStatusMessage(`Isolated test suite completed: ${data.summary}`);
      }
    } catch (err: any) {
      setStatusMessage(`Test execution error: ${err.message}`);
    } finally {
      setTestingProposalId(null);
    }
  };

  const handleApplyPatch = async (proposalId: string) => {
    setApplyingProposalId(proposalId);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/evolve/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          approvalToken,
          actorEmail: AUTHORIZED_OWNER_EMAIL,
          isHumanInteraction: true, // Human interactive click
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onProposalUpdated(data.proposal);
        if (data.snapshot) onSnapshotCreated(data.snapshot);
        setStatusMessage(`Patch applied successfully! Snapshot ${data.snapshot?.id} created for rollback.`);
      } else {
        setStatusMessage(`Authorization Rejected: ${data.error || 'Failed to apply patch'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error applying proposal: ${err.message}`);
    } finally {
      setApplyingProposalId(null);
    }
  };

  const handleRollback = async (snapshotId: string) => {
    try {
      const res = await fetch('/api/evolve/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId }),
      });
      const data = await res.json();
      if (data.success) {
        onRollbackCompleted(data.message);
        setStatusMessage(data.message);
      }
    } catch (err: any) {
      setStatusMessage(`Rollback failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
              EON EVOLVE // CODE PROPOSALS GATE
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 text-xs font-mono">HUMAN APPROVAL REQUIRED</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Software Evolution Proposals &amp; Diff Visualization
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Inspect unified code diffs, verify isolated sandbox test executions, and authorize deployments under strict Anti-Self-Approval governance.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
          <ShieldAlert className="w-4 h-4" />
          <span>ANTI-SELF-APPROVAL ACTIVE</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-violet-800/60 text-xs text-violet-200 font-mono">
          {statusMessage}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proposals List */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Proposal Queue</span>
            <span className="text-[10px] font-mono text-slate-400">{proposals.length} Items</span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[550px]">
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No evolution proposals generated yet. Use EON Evolve to inspect codebase and create a proposal.
              </div>
            ) : (
              proposals.map((prop) => {
                const isSelected = selectedProposal?.id === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedProposalId(prop.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          prop.riskLevel === 'low'
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                            : prop.riskLevel === 'medium'
                            ? 'text-amber-400 bg-amber-950/60 border-amber-800/40'
                            : 'text-rose-400 bg-rose-950/60 border-rose-800/40'
                        }`}
                      >
                        {prop.riskLevel} risk ({prop.riskScore})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {prop.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-200 mt-1.5 line-clamp-1">
                      {prop.title}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      {prop.targetFile}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Proposal Inspector */}
        {selectedProposal ? (
          <div className="lg:col-span-2 space-y-5">
            {/* Proposal Details Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">
                      {selectedProposal.id}
                    </span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-[11px] font-mono text-slate-400">{selectedProposal.targetFile}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">{selectedProposal.title}</h2>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                    STATUS: {selectedProposal.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedProposal.description}</p>

              {/* Risk Assessment Breakdown */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">RISK FACTORS</span>
                  <span className="font-mono text-slate-300 text-xs font-bold">
                    Risk Score: {selectedProposal.riskScore} / 100
                  </span>
                </div>
                <div className="space-y-1">
                  {selectedProposal.riskFactors.map((rf, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span>{rf}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unified Diff Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>UNIFIED CODE DIFF</span>
                  </span>
                  <span>Unified Format</span>
                </div>

                <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] leading-snug overflow-x-auto max-h-72">
                  {selectedProposal.unifiedDiff ? (
                    selectedProposal.unifiedDiff.split('\n').map((line, idx) => {
                      const isAdd = line.startsWith('+');
                      const isDel = line.startsWith('-');
                      const isHdr = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                      return (
                        <div
                          key={idx}
                          className={`${
                            isAdd
                              ? 'text-emerald-400 bg-emerald-950/30'
                              : isDel
                              ? 'text-rose-400 bg-rose-950/30'
                              : isHdr
                              ? 'text-cyan-400 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-500 italic">No diff changes detected.</div>
                  )}
                </div>
              </div>

              {/* Isolated Sandbox Test Runner */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-semibold text-white">Isolated Sandbox Test Suite</h3>
                  </div>

                  <button
                    onClick={() => handleRunTests(selectedProposal.id)}
                    disabled={testingProposalId === selectedProposal.id}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded border border-slate-700 transition-colors flex items-center space-x-1.5"
                  >
                    <Play className={`w-3 h-3 ${testingProposalId === selectedProposal.id ? 'animate-spin' : ''}`} />
                    <span>Run Isolated Tests</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedProposal.testCases.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-2.5 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-200">{tc.name}</span>
                          {tc.passed !== undefined && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                tc.passed
                                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                                  : 'text-rose-400 bg-rose-950/60 border border-rose-800'
                              }`}
                            >
                              {tc.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          Code: {tc.code} | Expected: {tc.expectedOutput}
                        </div>
                      </div>

                      {tc.executionTimeMs !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {tc.executionTimeMs}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Anti-Self-Approval Authorization Gate */}
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-800/40 space-y-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-violet-400" />
                  <h3 className="text-xs font-semibold text-white">
                    Owner Authorization Gate (Anti-Self-Approval Invariant)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  By design, EON Evolve cannot approve or deploy its own patches. Applying this proposal requires cryptographic authorization from the verified single owner ({AUTHORIZED_OWNER_EMAIL}).
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      OWNER APPROVAL TOKEN SIGNATURE
                    </label>
                    <input
                      type="text"
                      value={approvalToken}
                      onChange={(e) => setApprovalToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-200 text-xs"
                    />
                  </div>

                  <button
                    onClick={() => handleApplyPatch(selectedProposal.id)}
                    disabled={
                      applyingProposalId === selectedProposal.id ||
                      selectedProposal.status === 'applied' ||
                      selectedProposal.status === 'testing'
                    }
                    className="sm:self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-900/40 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {selectedProposal.status === 'applied'
                        ? 'Applied to Codebase'
                        : applyingProposalId === selectedProposal.id
                        ? 'Applying...'
                        : 'Authorize & Apply Patch'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Version Snapshots & Rollback Registry */}
            {snapshots.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-semibold text-white">Version Snapshots &amp; Rollback Registry</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{snapshots.length} Snapshots</span>
                </div>

                <div className="space-y-2">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-indigo-400">{snap.id}</span>
                          <span className="text-slate-200 font-medium">{snap.commitMessage}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Target: {snap.filePath} | Author: {snap.author} | {new Date(snap.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRollback(snap.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-medium rounded border border-slate-700 transition-colors flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
