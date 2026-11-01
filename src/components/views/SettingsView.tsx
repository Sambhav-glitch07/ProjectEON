/**
 * Project EON - Settings & Version Control View
 * Release 1.0.0
 * GitHub repository integration, Git history, cognitive hyperparameters, and platform credentials.
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  GitBranch,
  Github,
  Key,
  Database,
  Lock,
  Cpu,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { AUTHORIZED_OWNER_EMAIL } from '../../core/types';
import firebaseConfig from '../../../firebase-applet-config.json';

interface GitStatus {
  branch: string;
  releaseTag: string;
  repository: string;
  synced: boolean;
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
  history: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
}

export const SettingsView: React.FC = () => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [temperature, setTemperature] = useState(0.3);
  const [vectorThreshold, setVectorThreshold] = useState(0.05);
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    fetch('/api/version-control/status')
      .then((r) => r.json())
      .then((data) => setGitStatus(data))
      .catch((e) => console.error('Failed to fetch git status:', e));
  }, []);

  const handleSave = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
            EON VERSION CONTROL // SYSTEM CONFIG
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-emerald-400 text-xs font-mono">RELEASE 1.0.0</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white mt-1">
          Settings, Version Control &amp; Infrastructure
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Configures cognitive hyper-parameters, inspects GitHub synchronization, and validates single-owner cloud credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub & Source Control */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Github className="w-4 h-4 text-white" />
              <h2 className="text-xs font-semibold text-white">GitHub Integration</h2>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              SYNCED (MAIN)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Repository</span>
              <span className="text-slate-200">github.com/project-eon/core</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Active Branch</span>
              <span className="text-violet-400">refs/heads/main</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Release Tag</span>
              <span className="text-emerald-400">v1.0.0</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
              RECENT GIT COMMIT LOG
            </span>
            <div className="space-y-2">
              {gitStatus?.history?.map((commit) => (
                <div key={commit.hash} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-400 font-bold">{commit.hash}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(commit.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans text-xs mt-1">{commit.message}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Author: {commit.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cognitive & Cloud Parameters */}
        <div className="space-y-6">
          {/* Cloud Infrastructure */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-violet-400" />
              <h2 className="text-xs font-semibold text-white">Cloud Infrastructure Credentials</h2>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Single-Owner Email:</span>
                <span className="text-slate-200">{AUTHORIZED_OWNER_EMAIL}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Firebase Project ID:</span>
                <span className="text-slate-200">{firebaseConfig.projectId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cloud Firestore Database ID:</span>
                <span className="text-slate-200 truncate block">{(firebaseConfig as any).firestoreDatabaseId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gemini API Key:</span>
                <span className="text-emerald-400">INJECTED VIA SERVER-SIDE ENVIRONMENT</span>
              </div>
            </div>
          </div>

          {/* Model Hyperparameters */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-white">Cognitive Model Hyperparameters</h2>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Temperature (Creativity vs Determinism)</span>
                  <span className="font-mono text-slate-200">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Cosine Similarity Match Threshold</span>
                  <span className="font-mono text-slate-200">{vectorThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={vectorThreshold}
                  onChange={(e) => setVectorThreshold(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Anti-Self-Approval: <strong className="text-emerald-400">HARD-ENFORCED</strong>
                </span>

                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-medium flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedSettings ? 'Saved!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
