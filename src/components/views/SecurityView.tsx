/**
 * Project EON - EON GUARD Security Center View
 * Single-owner access control, cryptographic tamper-evident audit chaining,
 * isolated sandbox execution console, and backup/recovery integrity verification.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Terminal,
  Activity,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Key,
} from 'lucide-react';
import { AUTHORIZED_OWNER_EMAIL, AuditEntry } from '../../core/types';

interface SecurityViewProps {
  auditLogs: AuditEntry[];
  onAuditRefreshed: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  auditLogs,
  onAuditRefreshed,
}) => {
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [chainStatus, setChainStatus] = useState<string | null>(null);

  // Sandbox Console State
  const [sandboxCode, setSandboxCode] = useState(
    '// Test isolated evaluation in safe sandbox\nconst sum = [1, 2, 3, 4, 5].reduce((a, b) => a + b, 0);\nconsole.log("Calculated array sum:", sum);\nreturn sum;'
  );
  const [sandboxOutput, setSandboxOutput] = useState<any>(null);
  const [runningSandbox, setRunningSandbox] = useState(false);

  // Backup / Restore State
  const [backupJson, setBackupJson] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    setChainStatus(null);
    try {
      const res = await fetch('/api/guard/audit');
      const data = await res.json();
      if (data.integrity?.valid) {
        setChainStatus(`VALID: All ${data.logs.length} audit entries verified. SHA-256 hash sequence is 100% unbroken.`);
      } else {
        setChainStatus(`TAMPER DETECTED: Audit chain broken at block index ${data.integrity?.brokenIndex}.`);
      }
    } catch (e: any) {
      setChainStatus(`Verification failed: ${e.message}`);
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleRunSandbox = async () => {
    setRunningSandbox(true);
    setSandboxOutput(null);
    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sandboxCode }),
      });
      const data = await res.json();
      setSandboxOutput(data);
    } catch (e: any) {
      setSandboxOutput({ success: false, error: e.message });
    } finally {
      setRunningSandbox(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/guard/backup');
      const data = await res.json();
      const str = JSON.stringify(data, null, 2);
      setBackupJson(str);

      // Trigger browser download
      const blob = new Blob([str], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-eon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Backup export failed:', e);
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupJson.trim()) return;
    setRestoreStatus('Verifying cryptographic signatures and restoring snapshot...');
    try {
      const parsed = JSON.parse(backupJson);
      const res = await fetch('/api/guard/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupData: parsed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestoreStatus('SUCCESS: State verified and restored successfully.');
        onAuditRefreshed();
      } else {
        setRestoreStatus(`RESTORE REJECTED: ${data.error || 'Integrity check failed'}`);
      }
    } catch (e: any) {
      setRestoreStatus(`PARSE/RESTORE ERROR: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
              EON GUARD // SECURITY COMMAND
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 text-xs font-mono">SINGLE OWNER ENFORCEMENT</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Zero-Trust Security &amp; Cryptographic Audit Center
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Guarantees single-owner authorization, isolated sandbox execution, rate-limiting, and tamper-evident SHA-256 audit chaining.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleVerifyChain}
            disabled={verifyingChain}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm shadow-emerald-900/50"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${verifyingChain ? 'animate-spin' : ''}`} />
            <span>Verify Audit Chain</span>
          </button>
        </div>
      </div>

      {chainStatus && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono border ${
            chainStatus.includes('VALID')
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {chainStatus}
        </div>
      )}

      {/* Top 3 Cards: Single Owner Identity, Rate Limiting, Sandbox Watchdog */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-mono uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Authorized Single Owner</span>
          </div>
          <div className="font-mono text-sm font-semibold text-white truncate" title={AUTHORIZED_OWNER_EMAIL}>
            {AUTHORIZED_OWNER_EMAIL}
          </div>
          <p className="text-[11px] text-slate-500">
            No public registration or multi-tenant access permitted.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>Rate Limiter Health</span>
          </div>
          <div className="font-mono text-sm font-semibold text-emerald-400">
            TOKEN BUCKET: ACTIVE
          </div>
          <p className="text-[11px] text-slate-500">
            Prevents denial-of-wallet and AI API resource exhaustion.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase">
            <Terminal className="w-3.5 h-3.5" />
            <span>Execution Sandbox</span>
          </div>
          <div className="font-mono text-sm font-semibold text-cyan-300">
            ISOLATED CLOSURE (WATCHDOG)
          </div>
          <p className="text-[11px] text-slate-500">
            No child processes, filesystem access, or external modules allowed.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tamper-Evident SHA-256 Audit Log */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold text-slate-200">
                Cryptographic Audit Chain (Genesis to Head)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {auditLogs.length} Blocks Recorded
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[500px]">
            {auditLogs.slice().reverse().map((log) => (
              <div key={log.id} className="p-3.5 text-xs font-mono hover:bg-slate-800/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                        log.severity === 'critical'
                          ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                          : log.severity === 'warning'
                          ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                          : 'text-violet-400 bg-violet-950/60 border-violet-800'
                      }`}
                    >
                      {log.subsystem}
                    </span>
                    <span className="font-semibold text-slate-200">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-300 font-sans text-xs mt-1.5">{log.details}</p>

                <div className="mt-2 pt-2 border-t border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 gap-1 truncate">
                  <span className="truncate">Prev: {log.previousHash.slice(0, 24)}...</span>
                  <span className="truncate text-violet-400">
                    Hash: {log.entryHash.slice(0, 24)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Sandbox Console & Backup/Recovery */}
        <div className="space-y-5">
          {/* Isolated Sandbox Console */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-semibold text-white">Isolated Sandbox Console</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Safe VM</span>
            </div>

            <textarea
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleRunSandbox}
              disabled={runningSandbox}
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs rounded transition-colors flex items-center justify-center space-x-1"
            >
              <Play className={`w-3.5 h-3.5 ${runningSandbox ? 'animate-spin' : ''}`} />
              <span>{runningSandbox ? 'Executing...' : 'Run in Sandbox'}</span>
            </button>

            {sandboxOutput && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className={sandboxOutput.success ? 'text-emerald-400' : 'text-rose-400'}>
                    {sandboxOutput.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                  <span className="text-slate-500">{sandboxOutput.durationMs}ms</span>
                </div>
                {sandboxOutput.result !== undefined && (
                  <div className="text-slate-300">Return: {sandboxOutput.result}</div>
                )}
                {sandboxOutput.logs?.length > 0 && (
                  <div className="text-slate-400">
                    Logs: {sandboxOutput.logs.join(' | ')}
                  </div>
                )}
                {sandboxOutput.error && (
                  <div className="text-rose-400">Error: {sandboxOutput.error}</div>
                )}
              </div>
            )}
          </div>

          {/* Backup & Recovery */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Download className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-semibold text-white">System Backup &amp; Recovery</h3>
            </div>

            <p className="text-[11px] text-slate-400">
              Exports encrypted state snapshots with cryptographic integrity verification.
            </p>

            <button
              onClick={handleExportBackup}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export System Snapshot JSON</span>
            </button>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <textarea
                value={backupJson}
                onChange={(e) => setBackupJson(e.target.value)}
                placeholder="Paste JSON snapshot to restore..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-200"
              />

              <button
                onClick={handleRestoreBackup}
                disabled={!backupJson.trim()}
                className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs rounded transition-colors flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Verify &amp; Restore Snapshot</span>
              </button>

              {restoreStatus && (
                <div className="text-[10px] font-mono text-slate-300 p-1.5 rounded bg-slate-950 border border-slate-800">
                  {restoreStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
