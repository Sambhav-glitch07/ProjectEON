/**
 * Project EON - EON LAB Research Workbench View
 * Scientific hypothesis formulation, control vs experimental evaluations,
 * empirical metrics, and statistical significance analysis.
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LabExperiment } from '../../core/types';

interface LabViewProps {
  experiments: LabExperiment[];
  onExperimentCreated: (exp: LabExperiment) => void;
  onExperimentUpdated: (exp: LabExperiment) => void;
}

export const LabView: React.FC<LabViewProps> = ({
  experiments,
  onExperimentCreated,
  onExperimentUpdated,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(
    experiments[0]?.id || ''
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [runningExpId, setRunningExpId] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newControl, setNewControl] = useState('Standard baseline execution');
  const [newExperimental, setNewExperimental] = useState('Optimized experimental configuration');

  const selectedExp = experiments.find((e) => e.id === selectedExpId) || experiments[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newHypothesis.trim()) return;

    try {
      const res = await fetch('/api/lab/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          hypothesis: newHypothesis,
          controlConfig: newControl,
          experimentalConfig: newExperimental,
        }),
      });
      const created: LabExperiment = await res.json();
      onExperimentCreated(created);
      setSelectedExpId(created.id);
      setShowCreateModal(false);
      setNewTitle('');
      setNewHypothesis('');
    } catch (err) {
      console.error('Failed to create experiment:', err);
    }
  };

  const handleRun = async (expId: string) => {
    setRunningExpId(expId);
    try {
      const res = await fetch('/api/lab/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId: expId }),
      });
      const updated: LabExperiment = await res.json();
      onExperimentUpdated(updated);
    } catch (err) {
      console.error('Experiment execution failed:', err);
    } finally {
      setRunningExpId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              EON LAB // EMPIRICAL RESEARCH
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 text-xs font-mono">HYPOTHESIS TESTING ACTIVE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Research Hypotheses &amp; Empirical A/B Workbench
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Conducts controlled research experiments comparing baseline control configurations against experimental models, measuring p-scores and latency deltas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm shadow-cyan-900/50"
        >
          <Plus className="w-4 h-4" />
          <span>New Hypothesis</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Experiment Registry List */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Experiment Registry</span>
            <span className="text-[10px] font-mono text-slate-400">{experiments.length} Total</span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[550px]">
            {experiments.map((exp) => {
              const isSelected = selectedExp?.id === exp.id;
              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-950/30 border-l-2 border-cyan-500' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {exp.status}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      p ~= {exp.pScoreEstimate}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 mt-1.5 line-clamp-1">
                    {exp.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic">
                    &ldquo;{exp.hypothesis}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Lab Experiment Workbench */}
        {selectedExp && (
          <div className="lg:col-span-2 space-y-5">
            {/* Experiment Hero Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    {selectedExp.id}
                  </span>
                  <h2 className="text-base font-bold text-white">{selectedExp.title}</h2>
                </div>

                <button
                  onClick={() => handleRun(selectedExp.id)}
                  disabled={runningExpId === selectedExp.id}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm shadow-cyan-900/40 shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${runningExpId === selectedExp.id ? 'animate-spin' : ''}`} />
                  <span>{runningExpId === selectedExp.id ? 'Running Iterations...' : 'Execute Experiment'}</span>
                </button>
              </div>

              {/* Hypothesis Block */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  SCIENTIFIC HYPOTHESIS
                </span>
                <p className="text-xs text-slate-200 mt-1 italic">&ldquo;{selectedExp.hypothesis}&rdquo;</p>
              </div>

              {/* Control vs Experimental Config Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">CONTROL GROUP (A)</span>
                  <p className="font-mono text-slate-300 mt-1 text-[11px] whitespace-pre-wrap">
                    {selectedExp.controlPromptOrCode}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase">EXPERIMENTAL GROUP (B)</span>
                  <p className="font-mono text-cyan-200 mt-1 text-[11px] whitespace-pre-wrap">
                    {selectedExp.experimentalPromptOrCode}
                  </p>
                </div>
              </div>

              {/* Empirical Metrics Comparison Table */}
              {selectedExp.metrics && selectedExp.metrics.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    EMPIRICAL BENCHMARK METRICS
                  </span>
                  <div className="rounded-lg border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Metric</th>
                          <th className="p-2.5">Control (A)</th>
                          <th className="p-2.5">Experimental (B)</th>
                          <th className="p-2.5">Delta</th>
                          <th className="p-2.5">Favorability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {selectedExp.metrics.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="p-2.5 text-slate-200 font-sans font-medium">{m.name}</td>
                            <td className="p-2.5 text-slate-400">
                              {m.controlValue} {m.unit}
                            </td>
                            <td className="p-2.5 text-cyan-300 font-bold">
                              {m.experimentalValue} {m.unit}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`flex items-center space-x-1 ${
                                  m.favorable ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {m.favorable ? (
                                  <TrendingUp className="w-3.5 h-3.5" />
                                ) : (
                                  <TrendingDown className="w-3.5 h-3.5" />
                                )}
                                <span>
                                  {m.deltaPercentage > 0 ? '+' : ''}
                                  {m.deltaPercentage}%
                                </span>
                              </span>
                            </td>
                            <td className="p-2.5">
                              {m.favorable ? (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                                  FAVORABLE
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800/50 px-1.5 py-0.5 rounded">
                                  UNFAVORABLE
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conclusion Badge */}
              {selectedExp.conclusion && (
                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Scientific Conclusion &amp; Statistical Significance:</span>
                  </div>
                  <p className="text-emerald-200 text-[11px] leading-relaxed font-mono">
                    {selectedExp.conclusion}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Experiment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Create Research Hypothesis</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">EXPERIMENT TITLE</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Memory Compression via Sparse Vector Encoding"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">HYPOTHESIS STATEMENT</label>
                <textarea
                  value={newHypothesis}
                  onChange={(e) => setNewHypothesis(e.target.value)}
                  placeholder="e.g. Sparse vector indexing will reduce query latency by >=20% without accuracy loss."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px]">CONTROL GROUP (A)</label>
                  <textarea
                    value={newControl}
                    onChange={(e) => setNewControl(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px]">EXPERIMENTAL GROUP (B)</label>
                  <textarea
                    value={newExperimental}
                    onChange={(e) => setNewExperimental(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-500 font-medium"
                >
                  Initialize Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
