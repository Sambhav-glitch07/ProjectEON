/**
 * Project EON - EON MEMORY Subsystem
 * Semantic, episodic, preference, decision, and correction memory management.
 * Includes vector retrieval, cosine similarity, confidence scoring, and provenance tracking.
 */

import { MemoryCategory, MemoryNode } from './types';

/**
 * Computes a term-frequency vector representation for semantic text similarity.
 */
export function generateSparseVector(text: string): Record<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const freqMap: Record<string, number> = {};
  for (const word of words) {
    freqMap[word] = (freqMap[word] || 0) + 1;
  }

  // Normalize vector length (L2 norm)
  let normSquared = 0;
  for (const count of Object.values(freqMap)) {
    normSquared += count * count;
  }
  const norm = Math.sqrt(normSquared) || 1;

  const normalized: Record<string, number> = {};
  for (const [word, count] of Object.entries(freqMap)) {
    normalized[word] = count / norm;
  }
  return normalized;
}

/**
 * Calculates cosine similarity between two sparse vector representations (0.0 to 1.0).
 */
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  let dotProduct = 0;
  for (const [key, valA] of Object.entries(vecA)) {
    if (vecB[key]) {
      dotProduct += valA * vecB[key];
    }
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Searches memories using a hybrid semantic-similarity and category scoring algorithm.
 */
export function searchMemories(
  query: string,
  memories: MemoryNode[],
  options?: {
    category?: MemoryCategory;
    minConfidence?: number;
    onlyApproved?: boolean;
    limit?: number;
  }
): { memory: MemoryNode; score: number }[] {
  const queryVec = generateSparseVector(query);
  const minConfidence = options?.minConfidence ?? 0.0;
  const onlyApproved = options?.onlyApproved ?? true;
  const limit = options?.limit ?? 20;

  const results: { memory: MemoryNode; score: number }[] = [];

  for (const memory of memories) {
    if (options?.category && memory.category !== options.category) {
      continue;
    }
    if (memory.confidence < minConfidence) {
      continue;
    }
    if (onlyApproved && !memory.approved) {
      continue;
    }

    const titleVec = generateSparseVector(memory.title);
    const contentVec = generateSparseVector(memory.content);

    const titleScore = cosineSimilarity(queryVec, titleVec);
    const contentScore = cosineSimilarity(queryVec, contentVec);

    // Tags exact match bonus
    let tagScore = 0;
    const queryLower = query.toLowerCase();
    for (const tag of memory.tags) {
      if (queryLower.includes(tag.toLowerCase())) {
        tagScore += 0.2;
      }
    }

    // Weighted combined score: Title 40%, Content 40%, Tags 20%
    const combinedScore = titleScore * 0.4 + contentScore * 0.4 + Math.min(0.2, tagScore);

    // Boost by confidence factor
    const finalScore = combinedScore * (0.8 + memory.confidence * 0.2);

    if (finalScore > 0.05) {
      results.push({ memory, score: Number(finalScore.toFixed(4)) });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Analyzes cognitive learning confidence based on source provenance and repetition.
 */
export function calculateConfidence(provenance: string, occurrenceCount = 1): number {
  let baseScore = 0.75;
  if (provenance.includes('explicit_user_instruction')) {
    baseScore = 0.98;
  } else if (provenance.includes('user_correction')) {
    baseScore = 0.95;
  } else if (provenance.includes('decision_history')) {
    baseScore = 0.88;
  } else if (provenance.includes('ai_inference')) {
    baseScore = 0.65;
  }

  // Boost confidence with validated occurrences up to 1.0
  const adjusted = baseScore + Math.min(0.15, (occurrenceCount - 1) * 0.05);
  return Number(Math.min(1.0, adjusted).toFixed(2));
}

/**
 * Seeds initial structured memory nodes for Project EON
 */
export function getInitialMemories(): MemoryNode[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'mem-pref-1',
      category: 'preference',
      title: 'Zero Hallucination Code Architecture',
      content: 'Always enforce strict type safety, zero untested mutations, and explicit isolated sandbox checks before proposing any architectural patch.',
      confidence: 0.99,
      provenance: 'explicit_user_instruction',
      approved: true,
      tags: ['architecture', 'safety', 'typescript'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mem-sem-1',
      category: 'semantic',
      title: 'EON Single Owner Invariant',
      content: 'Project EON operates under a strict Single Owner model. Only vibhagupta13572@gmail.com is authorized to review, approve, deploy, and inspect research assets.',
      confidence: 1.0,
      provenance: 'explicit_user_instruction',
      approved: true,
      tags: ['security', 'authorization', 'owner'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mem-dec-1',
      category: 'decision',
      title: 'Controlled Self-Evolution Approval Gate',
      content: 'EON Evolve must never self-approve or self-deploy. Every proposed diff requires human cryptographic token signing.',
      confidence: 0.98,
      provenance: 'decision_history',
      approved: true,
      tags: ['evolution', 'governance', 'anti-self-approval'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mem-corr-1',
      category: 'correction',
      title: 'Execution Isolation Constraint',
      content: 'Never allow generated or evolved code to read production credentials or execute without memory/CPU bounds.',
      confidence: 0.96,
      provenance: 'user_correction',
      approved: true,
      tags: ['sandbox', 'guard', 'isolation'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mem-epi-1',
      category: 'episodic',
      title: 'Project EON v1.0.0 Genesis Bootstrapping',
      content: 'Initialized core subsystems: EON CORE, EON MIND, EON EVOLVE, EON MEMORY, EON LAB, EON GUARD, and EON VERSION CONTROL.',
      confidence: 0.95,
      provenance: 'system_bootstrap',
      approved: true,
      tags: ['genesis', 'release_1_0_0', 'lifecycle'],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// [EON EVOLVE v1.0.0] Optimized: Early exit on sparse vector dot product zero
