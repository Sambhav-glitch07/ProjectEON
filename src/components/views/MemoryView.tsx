/**
 * Project EON - EON MEMORY Subsystem View
 * Persistent episodic, semantic, preference, decision, and correction memory management
 * with semantic vector search, confidence scoring, provenance tracking, and approval queues.
 */

import React, { useState } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Tag,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { MemoryCategory, MemoryNode } from '../../core/types';

interface MemoryViewProps {
  memories: MemoryNode[];
  onMemoryCreated: (memory: MemoryNode) => void;
  onMemoryApproved: (id: string) => void;
  onMemoryDeleted: (id: string) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  onMemoryCreated,
  onMemoryApproved,
  onMemoryDeleted,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ memory: MemoryNode; score: number }[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form State
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preference');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('architecture, security');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Memories' },
    { id: 'episodic', label: 'Episodic' },
    { id: 'semantic', label: 'Semantic' },
    { id: 'preference', label: 'Preferences' },
    { id: 'decision', label: 'Decisions' },
    { id: 'correction', label: 'Corrections' },
  ];

  const handleSearch = async (queryText: string) => {
    setSearchQuery(queryText);
    if (!queryText.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          onlyApproved: false,
        }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/memory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          title: newTitle,
          content: newContent,
          provenance: 'explicit_user_instruction',
          confidence: 0.98,
          approved: true,
          tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const created = await res.json();
      onMemoryCreated(created);
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error('Failed to create memory:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch('/api/memory/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId: id }),
      });
      onMemoryApproved(id);
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/memory/${id}`, { method: 'DELETE' });
      onMemoryDeleted(id);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const displayedMemories = searchResults
    ? searchResults.map((r) => r.memory)
    : memories.filter((m) => selectedCategory === 'all' || m.category === selectedCategory);

  const pendingApprovalCount = memories.filter((m) => !m.approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-widest text-violet-400 bg-violet-950/60 border border-violet-800/50 px-2 py-0.5 rounded">
              EON MEMORY // KNOWLEDGE GRAPH
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 text-xs font-mono">COSINE VECTOR INDEX ACTIVE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Persistent Cognitive Memory System
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Stores episodic interactions, factual semantics, architectural preferences, decision histories, and user corrections with strict confidence attribution.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm shadow-violet-900/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory Node</span>
        </button>
      </div>

      {/* Pending Approval Banner */}
      {pendingApprovalCount > 0 && (
        <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-violet-200">
              There are <strong className="font-mono">{pendingApprovalCount}</strong> proposed cognitive learnings awaiting owner validation.
            </span>
          </div>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (searchQuery) handleSearch(searchQuery);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-violet-600/30 text-violet-200 border border-violet-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vector Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Semantic vector search memories..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No memories found matching this query or category filter.
          </div>
        ) : (
          displayedMemories.map((mem) => {
            const similarityMatch = searchResults?.find((r) => r.memory.id === mem.id);
            return (
              <div
                key={mem.id}
                className={`p-4 rounded-xl bg-slate-900/70 border transition-all flex flex-col justify-between ${
                  !mem.approved
                    ? 'border-violet-800/60 bg-violet-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {mem.category}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {similarityMatch && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1 rounded border border-cyan-800/50">
                          Match: {(similarityMatch.score * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-violet-400">
                        Conf: {(mem.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-white mt-2">{mem.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mem.content}</p>

                  {/* Provenance & Tags */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                      <ShieldCheck className="w-3 h-3 text-slate-400" />
                      <span>Provenance: {mem.provenance}</span>
                    </div>
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mem.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {!mem.approved && (
                      <button
                        onClick={() => handleApprove(mem.id)}
                        className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-medium rounded flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete memory node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Create EON Memory Node</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">CATEGORY</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                >
                  <option value="preference">Preference (Cognitive Incline)</option>
                  <option value="semantic">Semantic (Fact / Rule)</option>
                  <option value="decision">Decision (History &amp; Rationale)</option>
                  <option value="correction">Correction (Feedback / Alignment)</option>
                  <option value="episodic">Episodic (Session Event)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">TITLE</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Strict Zero-Trust AST Mutation"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">CONTENT</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explicit memory statement, rule or principle..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px]">TAGS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="architecture, safety, typescript"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-violet-600 text-white rounded hover:bg-violet-500 font-medium"
                >
                  Commit Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
