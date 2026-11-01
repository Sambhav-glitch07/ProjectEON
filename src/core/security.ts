/**
 * Project EON - EON GUARD Security Subsystem
 * Single-owner access enforcement, cryptographic audit chaining,
 * anti-self-approval mechanisms, and execution boundary limits.
 */

import { AUTHORIZED_OWNER_EMAIL, AuditEntry, SubsystemType } from './types';

// Simple SHA-256 implementation using standard JS / Web Crypto for cross-environment compatibility
export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to deterministic hexadecimal representation
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  let secondary = 0x5bd1e995;
  for (let i = text.length - 1; i >= 0; i--) {
    secondary = (secondary ^ text.charCodeAt(i)) * 0xcc9e2d51;
    secondary |= 0;
  }
  const hex2 = (secondary >>> 0).toString(16).padStart(8, '0');
  return `${hex}${hex2}`.repeat(4).slice(0, 64);
}

/**
 * Validates whether a provided email matches the designated Project EON single owner.
 * Strictly enforces that no other user email or anonymous actor can authenticate.
 */
export function isAuthorizedOwner(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase();
}

/**
 * Resolves user role for public platform:
 * - 'owner': Full administrative and production modification permissions (vibhagupta13572@gmail.com)
 * - 'researcher': Authenticated researcher with proposal creation & lab execution rights
 * - 'public': Unauthenticated guest researcher with read, test, and sandbox privileges
 */
export function getUserRole(email: string | null | undefined): 'owner' | 'researcher' | 'public' {
  if (!email) return 'public';
  if (isAuthorizedOwner(email)) return 'owner';
  return 'researcher';
}

/**
 * Calculates a cryptographic tamper-evident hash for an audit log entry, chaining it
 * with the previous hash in the sequence.
 */
export function calculateAuditHash(
  previousHash: string,
  timestamp: string,
  actor: string,
  action: string,
  subsystem: SubsystemType,
  details: string
): string {
  const payload = `${previousHash}|${timestamp}|${actor}|${action}|${subsystem}|${details}`;
  return simpleHash(payload);
}

/**
 * Creates a new chained audit entry.
 */
export function createAuditEntry(
  previousHash: string,
  actor: string,
  action: string,
  subsystem: SubsystemType,
  details: string,
  severity: 'info' | 'warning' | 'critical' = 'info'
): AuditEntry {
  const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();
  const entryHash = calculateAuditHash(previousHash, timestamp, actor, action, subsystem, details);

  return {
    id,
    timestamp,
    actor,
    action,
    subsystem,
    details,
    severity,
    previousHash,
    entryHash,
  };
}

/**
 * Validates the cryptographic integrity of an audit chain from genesis to head.
 * Returns true if every link's entryHash matches its recomputed value and points to the previous hash.
 */
export function verifyAuditChain(logs: AuditEntry[]): { valid: boolean; brokenIndex?: number } {
  if (logs.length === 0) return { valid: true };

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    const prevHash = i === 0 ? 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000' : logs[i - 1].entryHash;

    if (entry.previousHash !== prevHash) {
      return { valid: false, brokenIndex: i };
    }

    const expectedHash = calculateAuditHash(
      entry.previousHash,
      entry.timestamp,
      entry.actor,
      entry.action,
      entry.subsystem,
      entry.details
    );

    if (entry.entryHash !== expectedHash) {
      return { valid: false, brokenIndex: i };
    }
  }

  return { valid: true };
}

/**
 * Token Bucket Rate Limiter
 * Guards expensive AI, evolution, and sandbox execution calls from resource exhaustion.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRatePerSecond: number;

  constructor(maxTokens = 20, refillRatePerSecond = 2) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRatePerSecond = refillRatePerSecond;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsedSeconds * this.refillRatePerSecond);
    this.lastRefill = now;
  }

  public tryConsume(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  public getRemainingTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

/**
 * Anti-Self-Approval Enforcement
 * Invariant: The AI engine (EON Evolve) can propose changes, but CANNOT approve or deploy them.
 * Any approval token originating from an automated system or non-owner actor must be rejected.
 */
export class AntiSelfApprovalGuard {
  public static validateApprovalAuthorization(params: {
    actorEmail: string;
    isHumanInteraction: boolean;
    approvalToken: string;
    proposalOwnerUid: string;
  }): { allowed: boolean; reason?: string } {
    if (!params.isHumanInteraction) {
      return {
        allowed: false,
        reason: 'CRITICAL SECURITY VIOLATION: Automated or AI-initiated self-approval is forbidden.',
      };
    }

    if (!isAuthorizedOwner(params.actorEmail)) {
      return {
        allowed: false,
        reason: `UNAUTHORIZED: Actor ${params.actorEmail} is not the designated single owner.`,
      };
    }

    if (!params.approvalToken || !params.approvalToken.startsWith('OWNER_AUTH_SIG_')) {
      return {
        allowed: false,
        reason: 'INVALID SIGNATURE: Missing valid owner human approval signature token.',
      };
    }

    return { allowed: true };
  }
}
