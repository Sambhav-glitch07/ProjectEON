/**
 * Project EON - Core Unit Test Suite
 * Executed via node:test and tsx
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isAuthorizedOwner,
  getUserRole,
  createAuditEntry,
  verifyAuditChain,
  RateLimiter,
  AntiSelfApprovalGuard,
} from './security';

import {
  generateSparseVector,
  cosineSimilarity,
  searchMemories,
  calculateConfidence,
} from './memory';

import {
  generateUnifiedDiff,
  calculateRiskAssessment,
  runIsolatedTestCase,
  executeProposalTests,
} from './evolve';

import {
  calculateMetricDelta,
  evaluateExperimentResults,
} from './lab';

import { EvolutionProposal, MemoryNode, TestCase } from './types';

test('Security: Single-owner verification permits only vibhagupta13572@gmail.com', () => {
  assert.equal(isAuthorizedOwner('vibhagupta13572@gmail.com'), true);
  assert.equal(isAuthorizedOwner('Vibhagupta13572@gmail.com'), true); // case-insensitive
  assert.equal(isAuthorizedOwner('attacker@malicious.com'), false);
  assert.equal(isAuthorizedOwner(''), false);
  assert.equal(isAuthorizedOwner(undefined), false);
});

test('Security: Public role resolution identifies owner, researcher, and public guests', () => {
  assert.equal(getUserRole('vibhagupta13572@gmail.com'), 'owner');
  assert.equal(getUserRole('researcher@university.edu'), 'researcher');
  assert.equal(getUserRole(''), 'public');
  assert.equal(getUserRole(undefined), 'public');
});

test('Security: Anti-Self-Approval Guard rejects AI and non-owner approvals', () => {
  // Scenario 1: AI tries to approve its own change (isHumanInteraction = false)
  const aiSelfApproval = AntiSelfApprovalGuard.validateApprovalAuthorization({
    actorEmail: 'vibhagupta13572@gmail.com',
    isHumanInteraction: false,
    approvalToken: 'OWNER_AUTH_SIG_12345',
    proposalOwnerUid: 'uid-1',
  });
  assert.equal(aiSelfApproval.allowed, false);
  assert.match(aiSelfApproval.reason || '', /CRITICAL SECURITY VIOLATION/);

  // Scenario 2: Unauthorized human tries to approve
  const unauthApproval = AntiSelfApprovalGuard.validateApprovalAuthorization({
    actorEmail: 'other@domain.com',
    isHumanInteraction: true,
    approvalToken: 'OWNER_AUTH_SIG_12345',
    proposalOwnerUid: 'uid-1',
  });
  assert.equal(unauthApproval.allowed, false);
  assert.match(unauthApproval.reason || '', /UNAUTHORIZED/);

  // Scenario 3: Legitimate owner with human interaction and valid token
  const legitimate = AntiSelfApprovalGuard.validateApprovalAuthorization({
    actorEmail: 'vibhagupta13572@gmail.com',
    isHumanInteraction: true,
    approvalToken: 'OWNER_AUTH_SIG_99999',
    proposalOwnerUid: 'uid-1',
  });
  assert.equal(legitimate.allowed, true);
});

test('Security: Tamper-evident audit chain detects corrupted entries', () => {
  const genesis = 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000';
  const entry1 = createAuditEntry(genesis, 'owner', 'BOOTSTRAP', 'EON CORE', 'System started');
  const entry2 = createAuditEntry(entry1.entryHash, 'owner', 'MEMORY_ADD', 'EON MEMORY', 'Added memory');
  const entry3 = createAuditEntry(entry2.entryHash, 'owner', 'PROPOSAL_GEN', 'EON EVOLVE', 'Proposed patch');

  const validChain = [entry1, entry2, entry3];
  assert.equal(verifyAuditChain(validChain).valid, true);

  // Corrupt entry 2 details
  const tamperedChain = [
    entry1,
    { ...entry2, details: 'ATTACKER_TAMPERED_CONTENT' },
    entry3,
  ];
  const check = verifyAuditChain(tamperedChain);
  assert.equal(check.valid, false);
  assert.equal(check.brokenIndex, 1);
});

test('Security: RateLimiter manages token consumption correctly', () => {
  const limiter = new RateLimiter(5, 0); // 5 tokens, no refill for deterministic test
  assert.equal(limiter.tryConsume(3), true);
  assert.equal(limiter.getRemainingTokens(), 2);
  assert.equal(limiter.tryConsume(3), false); // not enough tokens
  assert.equal(limiter.tryConsume(2), true);
  assert.equal(limiter.getRemainingTokens(), 0);
  assert.equal(limiter.tryConsume(1), false);
});

test('Memory: Sparse vector and cosine similarity rank semantic matches accurately', () => {
  const vec1 = generateSparseVector('zero hallucination typescript architecture');
  const vec2 = generateSparseVector('strictly typed typescript architecture without errors');
  const vec3 = generateSparseVector('banana apple orange fruit salad');

  const simHigh = cosineSimilarity(vec1, vec2);
  const simLow = cosineSimilarity(vec1, vec3);

  assert.ok(simHigh > 0.3, `Expected high similarity, got ${simHigh}`);
  assert.ok(simLow < 0.1, `Expected low similarity, got ${simLow}`);

  const mockMemories: MemoryNode[] = [
    {
      id: 'm1',
      category: 'preference',
      title: 'Type Safety Guideline',
      content: 'Always use strict TypeScript and explicit interfaces.',
      confidence: 0.95,
      provenance: 'explicit_user_instruction',
      approved: true,
      tags: ['typescript', 'safety'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm2',
      category: 'semantic',
      title: 'Database Schema Details',
      content: 'Firestore documents contain maximum 1MB data.',
      confidence: 0.9,
      provenance: 'system_docs',
      approved: true,
      tags: ['firestore', 'storage'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const searchResults = searchMemories('typescript interfaces', mockMemories);
  assert.ok(searchResults.length > 0);
  assert.equal(searchResults[0].memory.id, 'm1');
});

test('Memory: Provenance confidence tracking reflects source reliability', () => {
  const confUser = calculateConfidence('explicit_user_instruction', 1);
  const confCorrection = calculateConfidence('user_correction', 1);
  const confInference = calculateConfidence('ai_inference', 1);

  assert.ok(confUser > 0.95);
  assert.ok(confCorrection > 0.90);
  assert.ok(confInference < 0.75);
});

test('Evolve: Diff generator creates accurate unified diffs', () => {
  const original = 'const a = 1;\nconst b = 2;';
  const proposed = 'const a = 1;\nconst b = 3;\nconst c = 4;';
  const diff = generateUnifiedDiff('test.ts', original, proposed);

  assert.match(diff, /--- a\/test\.ts/);
  assert.match(diff, /\+ const b = 3;/);
  assert.match(diff, /\+ const c = 4;/);
});

test('Evolve: Risk assessment identifies critical security and self-approval edits', () => {
  // Case 1: Modifies security file and attempts to bypass AntiSelfApproval
  const critRisk = calculateRiskAssessment(
    'src/core/security.ts',
    'const check = true;',
    'const AntiSelfApproval = false;\n// bypass check'
  );
  assert.equal(critRisk.riskLevel, 'critical');
  assert.ok(critRisk.riskScore >= 75);

  // Case 2: Safe localized algorithmic change
  const lowRisk = calculateRiskAssessment(
    'src/utils/math.ts',
    'return a + b;',
    'return (a + b) | 0;'
  );
  assert.equal(lowRisk.riskLevel, 'low');
  assert.ok(lowRisk.riskScore < 25);
});

test('Evolve: Isolated test runner executes test assertions cleanly', () => {
  const passingTest: TestCase = {
    id: 't1',
    name: 'Addition check',
    code: 'return 2 + 2;',
    expectedOutput: '4',
  };

  const executed = runIsolatedTestCase(passingTest, 'dummy');
  assert.equal(executed.passed, true);
  assert.equal(executed.actualOutput, '4');

  const failingTest: TestCase = {
    id: 't2',
    name: 'Failing check',
    code: 'return 2 + 2;',
    expectedOutput: '5',
  };
  const executedFail = runIsolatedTestCase(failingTest, 'dummy');
  assert.equal(executedFail.passed, false);
});

test('Lab: Experiment delta calculation and hypothesis evaluation', () => {
  const metric = calculateMetricDelta('Latency', 'ms', 1000, 400, true);
  assert.equal(metric.favorable, true);
  assert.equal(metric.deltaPercentage, -60);

  const experiment = evaluateExperimentResults(
    {
      id: 'exp-test',
      title: 'Latency reduction',
      hypothesis: 'Caching decreases latency',
      controlPromptOrCode: 'no cache',
      experimentalPromptOrCode: 'cache',
      iterations: 10,
      controlOutput: 'slow',
      experimentalOutput: 'fast',
      createdAt: new Date().toISOString(),
    },
    [metric]
  );

  assert.equal(experiment.status, 'completed');
  assert.ok(experiment.pScoreEstimate < 0.1);
  assert.match(experiment.conclusion || '', /HYPOTHESIS VALIDATED/);
});
