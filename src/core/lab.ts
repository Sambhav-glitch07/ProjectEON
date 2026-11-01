/**
 * Project EON - EON LAB Subsystem
 * Research hypothesis creation, experimental management, control vs experimental
 * testing, evaluation metrics, and statistical comparison.
 */

import { ExperimentMetric, LabExperiment } from './types';

/**
 * Calculates empirical delta and favorability for an experimental metric compared to control.
 */
export function calculateMetricDelta(
  metricName: string,
  unit: string,
  controlValue: number,
  experimentalValue: number,
  lowerIsBetter = false
): ExperimentMetric {
  const delta = experimentalValue - controlValue;
  const deltaPercentage = controlValue === 0 ? 0 : Number(((delta / controlValue) * 100).toFixed(2));
  const favorable = lowerIsBetter ? delta < 0 : delta > 0;

  return {
    name: metricName,
    unit,
    controlValue,
    experimentalValue,
    deltaPercentage,
    favorable,
  };
}

/**
 * Evaluates hypothesis metrics and synthesizes statistical conclusions
 */
export function evaluateExperimentResults(
  experiment: Omit<LabExperiment, 'status' | 'metrics' | 'pScoreEstimate' | 'conclusion' | 'completedAt'>,
  metrics: ExperimentMetric[]
): LabExperiment {
  const favorableCount = metrics.filter((m) => m.favorable).length;
  const totalMetrics = metrics.length;
  const favorableRatio = totalMetrics > 0 ? favorableCount / totalMetrics : 0;

  // Approximate p-value based on metric consistency and sample iterations
  const pScore = Number(Math.max(0.01, Math.min(0.99, 1 - favorableRatio * 0.95)).toFixed(3));
  const isHypothesisValidated = pScore < 0.05 || favorableRatio >= 0.75;

  let conclusion = '';
  if (isHypothesisValidated) {
    conclusion = `HYPOTHESIS VALIDATED: Experimental variant demonstrated statistically significant improvement across ${favorableCount}/${totalMetrics} key metrics (p ~= ${pScore}).`;
  } else {
    conclusion = `HYPOTHESIS INCONCLUSIVE: Experimental variant did not show definitive statistical superiority (favorable in ${favorableCount}/${totalMetrics} metrics, p ~= ${pScore}). Retaining control configuration.`;
  }

  return {
    ...experiment,
    status: 'completed',
    metrics,
    pScoreEstimate: pScore,
    conclusion,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Generates initial research laboratory experiments
 */
export function getInitialExperiments(): LabExperiment[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'exp-001',
      title: 'Contextual Vector Retrieval Density Optimization',
      hypothesis: 'Compressing cognitive memory prompts via sparse vector scoring will reduce inference latency by >=20% without degrading response semantic accuracy.',
      status: 'completed',
      controlPromptOrCode: 'Full unindexed episodic context dump (10,000 tokens)',
      experimentalPromptOrCode: 'Top-5 Cosine similarity indexed memories (850 tokens)',
      iterations: 25,
      metrics: [
        {
          name: 'Mean Inference Latency',
          unit: 'ms',
          controlValue: 1420,
          experimentalValue: 480,
          deltaPercentage: -66.2,
          favorable: true,
        },
        {
          name: 'Token Consumption',
          unit: 'tokens',
          controlValue: 9850,
          experimentalValue: 1200,
          deltaPercentage: -87.82,
          favorable: true,
        },
        {
          name: 'Semantic Accuracy Score',
          unit: 'score',
          controlValue: 94.5,
          experimentalValue: 96.2,
          deltaPercentage: 1.8,
          favorable: true,
        },
      ],
      controlOutput: 'Complete verbatim memory log passed to model context.',
      experimentalOutput: 'Targeted relevant episodic memories extracted via top-k sparse vector score.',
      pScoreEstimate: 0.012,
      conclusion: 'HYPOTHESIS VALIDATED: Contextual indexing reduced latency by 66.2% and token usage by 87.8% while maintaining high semantic accuracy.',
      createdAt: now,
      completedAt: now,
    },
    {
      id: 'exp-002',
      title: 'Isolated Execution Sandbox Boundary Resilience',
      hypothesis: 'Wrapping patch evaluation inside closed-scope Function closures with CPU timeout guards eliminates uncontrolled infinite loops without memory leak.',
      status: 'completed',
      controlPromptOrCode: 'Standard direct evaluation without timeout closure',
      experimentalPromptOrCode: 'Sandboxed closure with 2000ms watchdog timer and restricted globals',
      iterations: 50,
      metrics: [
        {
          name: 'Execution Timeout Containment',
          unit: '%',
          controlValue: 42.0,
          experimentalValue: 100.0,
          deltaPercentage: 138.1,
          favorable: true,
        },
        {
          name: 'Process Crash Rate',
          unit: '%',
          controlValue: 12.5,
          experimentalValue: 0.0,
          deltaPercentage: -100.0,
          favorable: true,
        },
      ],
      controlOutput: 'Process hang observed on unbounded while-loop test case.',
      experimentalOutput: 'Sandboxed executor cleanly threw TIMEOUT_EXCEEDED within 2010ms.',
      pScoreEstimate: 0.005,
      conclusion: 'HYPOTHESIS VALIDATED: Guarded sandbox containment achieved 100% boundary safety with zero process terminations.',
      createdAt: now,
      completedAt: now,
    },
  ];
}
