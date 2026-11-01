/**
 * Project EON - Navigation & System Header
 * Release 1.0.0
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
  Settings,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AUTHORIZED_OWNER_EMAIL, SystemStatus } from '../core/types';

export type ActiveTab =
  | 'overview'
  | 'mind'
  | 'evolve'
  | 'memory'
  | 'lab'
  | 'proposals'
  | 'security'
  | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  status: SystemStatus | null;
  currentUserEmail: string;
  isOwnerVerified: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  status,
  currentUserEmail,
  isOwnerVerified,
  onSignIn,
  onSignOut,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'mind', label: 'EON Mind', icon: Brain },
    { id: 'evolve', label: 'EON Evolve', icon: Cpu },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'lab', label: 'Research Lab', icon: FlaskConical },
    { id: 'proposals', label: 'Code Proposals', icon: GitPullRequest },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subsystem Badge */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onTabChange('overview')}
              className="flex items-center space-x-2 text-left focus:outline-none"
              aria-label="Go to Overview"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center border border-violet-500/30 shadow-sm shadow-violet-900/40">
                <span className="font-mono font-bold text-white text-sm">E</span>
              </div>
              <div>
                <span className="font-bold tracking-wider text-slate-100 text-sm">PROJECT EON</span>
                <span className="ml-2 font-mono text-[10px] uppercase text-violet-400 bg-violet-950/60 border border-violet-800/40 px-1.5 py-0.5 rounded">
                  PUBLIC v1.0.0
                </span>
              </div>
            </button>

            {/* Core Status indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 pl-4 border-l border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] tracking-wide text-emerald-400">PUBLIC ACCESS ONLINE</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Identity & Sign In/Out Control */}
          <div className="flex items-center space-x-2">
            {currentUserEmail ? (
              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                <div className="flex flex-col text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {isOwnerVerified ? 'Platform Owner' : 'Researcher'}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-label="Verified" />
                  </div>
                  <span className="font-mono text-slate-200 text-[11px] max-w-[150px] truncate" title={currentUserEmail}>
                    {currentUserEmail}
                  </span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="ml-2 text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-block font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded">
                  PUBLIC RESEARCH ACCESS
                </span>
                {onSignIn && (
                  <button
                    onClick={onSignIn}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1 shadow-sm shadow-violet-900/40"
                  >
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex overflow-x-auto space-x-1 py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40'
                    : 'text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
