/**
 * Project EON - Core Types
 * Release 1.0.0
 */

export const AUTHORIZED_OWNER_EMAIL = 'vibhagupta13572@gmail.com';

export type SubsystemType =
  | 'EON CORE'
  | 'EON MIND'
  | 'EON EVOLVE'
  | 'EON MEMORY'
  | 'EON LAB'
  | 'EON GUARD'
  | 'EON VERSION CONTROL';

export type MemoryCategory =
  | 'episodic'
  | 'semantic'
  | 'preference'
  | 'decision'
  | 'correction';

export interface MemoryNode {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  confidence: number; // 0.0 - 1.0
  provenance: string; // origin, source message, or experiment ID
  approved: boolean; // requires owner approval if auto-extracted
  tags: string[];
  embeddingVector?: number[];
  createdAt: string;
  updatedAt: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ProposalStatus =
  | 'proposed'
  | 'testing'
  | 'test_passed'
  | 'test_failed'
  | 'approved'
  | 'rejected'
  | 'applied'
  | 'reverted';

export interface TestCase {
  id: string;
  name: string;
  code: string;
  expectedOutput: string;
  passed?: boolean;
  actualOutput?: string;
  executionTimeMs?: number;
}

export interface EvolutionProposal {
  id: string;
  title: string;
  description: string;
  targetFile: string;
  originalCode: string;
  proposedCode: string;
  unifiedDiff: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  riskFactors: string[];
  status: ProposalStatus;
  testCases: TestCase[];
  testOutput?: string;
  performanceDelta?: {
    memoryEstimate: string;
    speedEstimate: string;
    complexityDelta: number;
  };
  approvedBy?: string; // Must match AUTHORIZED_OWNER_EMAIL
  approvedAt?: string;
  humanApprovalToken?: string;
  createdAt: string;
}

export interface VersionSnapshot {
  id: string;
  proposalId: string;
  timestamp: string;
  filePath: string;
  previousContent: string;
  newContent: string;
  commitMessage: string;
  author: string;
}

export type ExperimentStatus = 'draft' | 'running' | 'completed' | 'archived';

export interface ExperimentMetric {
  name: string;
  unit: string;
  controlValue: number;
  experimentalValue: number;
  deltaPercentage: number;
  favorable: boolean;
}

export interface LabExperiment {
  id: string;
  title: string;
  hypothesis: string;
  status: ExperimentStatus;
  controlPromptOrCode: string;
  experimentalPromptOrCode: string;
  iterations: number;
  metrics: ExperimentMetric[];
  controlOutput: string;
  experimentalOutput: string;
  pScoreEstimate: number; // 0.0 - 1.0 (statistical significance)
  conclusion?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  subsystem: SubsystemType;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  previousHash: string;
  entryHash: string;
}

export interface SystemStatus {
  coreStatus: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  version: string;
  ownerEmail: string;
  accessMode: 'PUBLIC' | 'RESTRICTED';
  authenticated: boolean;
  userRole?: 'owner' | 'researcher' | 'public';
  subsystems: {
    mind: boolean;
    evolve: boolean;
    memory: boolean;
    lab: boolean;
    guard: boolean;
    versionControl: boolean;
  };
  stats: {
    memoriesCount: number;
    proposalsCount: number;
    experimentsCount: number;
    auditLogsCount: number;
    securityIncidents: number;
  };
}
