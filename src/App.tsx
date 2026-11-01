/**
 * Project EON - Release 1.0.0
 * Autonomous Cognitive Research & Software Evolution Platform
 * Single Owner Architecture: vibhagupta13572@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logoutOwner, testFirestoreConnection } from './firebase';
import {
  AUTHORIZED_OWNER_EMAIL,
  AuditEntry,
  EvolutionProposal,
  LabExperiment,
  MemoryNode,
  SystemStatus,
  VersionSnapshot,
} from './core/types';
import { isAuthorizedOwner, createAuditEntry } from './core/security';
import { getInitialMemories } from './core/memory';
import { getInitialExperiments } from './core/lab';
import { getClientInitialProposals, getClientInitialStatus } from './core/clientBridge';
import { Navigation, ActiveTab } from './components/Navigation';
import { OverviewView } from './components/views/OverviewView';
import { MindView } from './components/views/MindView';
import { EvolveView } from './components/views/EvolveView';
import { MemoryView } from './components/views/MemoryView';
import { LabView } from './components/views/LabView';
import { ProposalsView } from './components/views/ProposalsView';
import { SecurityView } from './components/views/SecurityView';
import { SettingsView } from './components/views/SettingsView';
import { ShieldAlert, Lock, AlertTriangle, LogIn } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Auth & Single Owner Validation
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string>(AUTHORIZED_OWNER_EMAIL);
  const [isOwnerVerified, setIsOwnerVerified] = useState<boolean>(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Application Data Stores
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [proposals, setProposals] = useState<EvolutionProposal[]>([]);
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [experiments, setExperiments] = useState<LabExperiment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  // Fetch initial telemetry and collections from backend or local fallback for GitHub Pages
  const loadInitialData = async () => {
    try {
      const statusRes = await fetch('/api/system/status').catch(() => null);

      if (statusRes && statusRes.ok) {
        const text = await statusRes.text();
        try {
          const statusData = JSON.parse(text);
          setSystemStatus(statusData);

          const [memoryRes, evolveRes, labRes, auditRes] = await Promise.all([
            fetch('/api/memory/list'),
            fetch('/api/evolve/proposals'),
            fetch('/api/lab/experiments'),
            fetch('/api/guard/audit'),
          ]);

          if (memoryRes.ok) setMemories(await memoryRes.json());
          if (evolveRes.ok) {
            const evolveData = await evolveRes.json();
            setProposals(evolveData.proposals || []);
            setSnapshots(evolveData.snapshots || []);
          }
          if (labRes.ok) setExperiments(await labRes.json());
          if (auditRes.ok) {
            const auditData = await auditRes.json();
            setAuditLogs(auditData.logs || []);
          }
          return;
        } catch {
          // Response was not JSON (e.g. index.html served on GitHub Pages)
        }
      }
    } catch {
      // Backend not reached
    }

    // Static / GitHub Pages Standalone Fallback
    const initialMems = getInitialMemories();
    const initialProps = getClientInitialProposals();
    const initialExps = getInitialExperiments();
    const genesisAudit = [
      createAuditEntry(
        'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000',
        'SYSTEM',
        'CORE_BOOTSTRAP',
        'EON CORE',
        'Project EON v1.0.0 Public Edition initialized for GitHub Pages.'
      ),
    ];

    setMemories(initialMems);
    setProposals(initialProps);
    setExperiments(initialExps);
    setAuditLogs(genesisAudit);
    setSystemStatus(
      getClientInitialStatus(
        initialMems.length,
        initialProps.length,
        initialExps.length,
        genesisAudit.length
      )
    );
  };

  useEffect(() => {
    loadInitialData();
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const email = user.email || '';
        setOwnerEmail(email);

        const isOwner = isAuthorizedOwner(email);
        setIsOwnerVerified(isOwner);
        setAccessDeniedMessage(null);
      } else {
        // Public researcher default session
        setCurrentUser(null);
        setOwnerEmail('');
        setIsOwnerVerified(false);
        setAccessDeniedMessage(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (e: any) {
      console.error('Login error:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutOwner();
    } catch (e: any) {
      console.error('Logout error:', e);
    }
  };

  // Callback Handlers for Real-time Reactive UI updates
  const handleMemoryCreated = (newMem: MemoryNode) => {
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleMemoryApproved = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approved: true } : m))
    );
  };

  const handleMemoryDeleted = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleProposalCreated = (newProp: EvolutionProposal) => {
    setProposals((prev) => [newProp, ...prev]);
  };

  const handleProposalUpdated = (updatedProp: EvolutionProposal) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === updatedProp.id ? updatedProp : p))
    );
  };

  const handleSnapshotCreated = (snap: VersionSnapshot) => {
    setSnapshots((prev) => [snap, ...prev]);
  };

  const handleRollbackCompleted = (msg: string) => {
    loadInitialData();
  };

  const handleExperimentCreated = (exp: LabExperiment) => {
    setExperiments((prev) => [exp, ...prev]);
  };

  const handleExperimentUpdated = (updatedExp: LabExperiment) => {
    setExperiments((prev) =>
      prev.map((e) => (e.id === updatedExp.id ? updatedExp : e))
    );
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-violet-600/30">
      {/* Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        status={systemStatus}
        currentUserEmail={ownerEmail}
        isOwnerVerified={isOwnerVerified}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            status={systemStatus}
            memories={memories}
            proposals={proposals}
            experiments={experiments}
            auditLogs={auditLogs}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'mind' && (
          <MindView onMemoryCreated={handleMemoryCreated} />
        )}

        {activeTab === 'evolve' && (
          <EvolveView
            onProposalCreated={handleProposalCreated}
            onNavigateToProposals={() => setActiveTab('proposals')}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryView
            memories={memories}
            onMemoryCreated={handleMemoryCreated}
            onMemoryApproved={handleMemoryApproved}
            onMemoryDeleted={handleMemoryDeleted}
          />
        )}

        {activeTab === 'lab' && (
          <LabView
            experiments={experiments}
            onExperimentCreated={handleExperimentCreated}
            onExperimentUpdated={handleExperimentUpdated}
          />
        )}

        {activeTab === 'proposals' && (
          <ProposalsView
            proposals={proposals}
            snapshots={snapshots}
            onProposalUpdated={handleProposalUpdated}
            onSnapshotCreated={handleSnapshotCreated}
            onRollbackCompleted={handleRollbackCompleted}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            auditLogs={auditLogs}
            onAuditRefreshed={loadInitialData}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080f] py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] text-slate-400">PROJECT EON v1.0.0</span>
            <span>•</span>
            <span className="text-slate-500">Single Owner Architecture</span>
            <span>•</span>
            <span className="text-violet-400 font-mono text-[10px]">{AUTHORIZED_OWNER_EMAIL}</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span>EON CORE</span>
            <span>EON MIND</span>
            <span>EON EVOLVE</span>
            <span>EON MEMORY</span>
            <span>EON LAB</span>
            <span>EON GUARD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
