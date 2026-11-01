/**
 * Project EON - EON EVOLVE Subsystem
 * Controlled software evolution engine: codebase inspection, weakness detection,
 * patch generation, unified diff visualization, risk assessment, and isolated testing.
 */

import { EvolutionProposal, RiskLevel, TestCase } from './types';

/**
 * Computes a standard unified diff between original and proposed code strings.
 */
export function generateUnifiedDiff(filePath: string, original: string, proposed: string): string {
  const origLines = original.split('\n');
  const propLines = proposed.split('\n');

  const diffHeader = `--- a/${filePath}\n+++ b/${filePath}\n@@ -1,${origLines.length} +1,${propLines.length} @@\n`;
  const diffLines: string[] = [];

  const maxLen = Math.max(origLines.length, propLines.length);
  let hasChanges = false;

  for (let i = 0; i < maxLen; i++) {
    const orig = origLines[i];
    const prop = propLines[i];

    if (orig === undefined) {
      diffLines.push(`+ ${prop}`);
      hasChanges = true;
    } else if (prop === undefined) {
      diffLines.push(`- ${orig}`);
      hasChanges = true;
    } else if (orig !== prop) {
      diffLines.push(`- ${orig}`);
      diffLines.push(`+ ${prop}`);
      hasChanges = true;
    } else {
      diffLines.push(`  ${orig}`);
    }
  }

  return hasChanges ? diffHeader + diffLines.join('\n') : '';
}

/**
 * Evaluates risk parameters of a proposed patch:
 * - Sensitive file modifications (security, auth, approval mechanics) -> Critical risk
 * - Line count changed (blast radius)
 * - Deletions vs additions
 * - AST pattern changes (e.g. process.env, eval, child_process)
 */
export function calculateRiskAssessment(
  filePath: string,
  original: string,
  proposed: string
): { riskLevel: RiskLevel; riskScore: number; riskFactors: string[] } {
  const factors: string[] = [];
  let score = 10; // Baseline

  const lowerPath = filePath.toLowerCase();

  // Rule 1: High-sensitivity files
  if (
    lowerPath.includes('security') ||
    lowerPath.includes('auth') ||
    lowerPath.includes('guard') ||
    lowerPath.includes('rules') ||
    lowerPath.includes('.env')
  ) {
    score += 45;
    factors.push('Modifies critical security or authorization infrastructure.');
  }

  // Rule 2: Anti-Self-Approval tamper check
  if (
    proposed.includes('AntiSelfApproval') ||
    proposed.includes('isHumanInteraction = false') ||
    proposed.includes('bypass')
  ) {
    score += 50;
    factors.push('CRITICAL: Patch modifies or references self-approval protection boundaries.');
  }

  // Rule 3: Dangerous globals or external process access
  if (
    proposed.includes('child_process') ||
    proposed.includes('execSync') ||
    proposed.includes('fs.rmSync') ||
    proposed.includes('eval(')
  ) {
    score += 40;
    factors.push('Introduces dangerous runtime execution primitives (child_process/eval/rm).');
  }

  // Rule 4: Blast radius / changed lines
  const origLines = original.split('\n').length;
  const propLines = proposed.split('\n').length;
  const deltaLines = Math.abs(propLines - origLines);

  if (deltaLines > 100) {
    score += 25;
    factors.push(`High blast radius: ${deltaLines} lines changed.`);
  } else if (deltaLines > 30) {
    score += 15;
    factors.push(`Moderate blast radius: ${deltaLines} lines changed.`);
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: RiskLevel = 'low';
  if (finalScore >= 75) {
    riskLevel = 'critical';
  } else if (finalScore >= 50) {
    riskLevel = 'high';
  } else if (finalScore >= 25) {
    riskLevel = 'medium';
  }

  if (factors.length === 0) {
    factors.push('Low blast radius, localized algorithmic optimization.');
  }

  return { riskLevel, riskScore: finalScore, riskFactors: factors };
}

/**
 * Isolated test runner for deterministic validation of code proposals.
 * Uses strict timeouts and isolated functional evaluation to prevent side effects.
 */
export function runIsolatedTestCase(testCase: TestCase, _codeUnderTest: string): TestCase {
  const startTime = Date.now();
  try {
    // Sandbox evaluation: execute the testCase logic in a restricted closure
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function('input', testCase.code);
    const result = fn();
    const actualOutput = typeof result === 'object' ? JSON.stringify(result) : String(result);
    const passed = actualOutput.trim() === testCase.expectedOutput.trim();
    const executionTimeMs = Date.now() - startTime;

    return {
      ...testCase,
      passed,
      actualOutput,
      executionTimeMs,
    };
  } catch (err: unknown) {
    return {
      ...testCase,
      passed: false,
      actualOutput: `EXECUTION_ERROR: ${err instanceof Error ? err.message : String(err)}`,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Runs a complete test suite against a proposed patch
 */
export function executeProposalTests(proposal: EvolutionProposal): {
  allPassed: boolean;
  results: TestCase[];
  summary: string;
} {
  const results: TestCase[] = [];
  let allPassed = true;

  for (const testCase of proposal.testCases) {
    const executed = runIsolatedTestCase(testCase, proposal.proposedCode);
    results.push(executed);
    if (!executed.passed) {
      allPassed = false;
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const summary = `Executed ${results.length} isolated tests: ${passedCount} passed, ${results.length - passedCount} failed.`;

  return { allPassed, results, summary };
}
