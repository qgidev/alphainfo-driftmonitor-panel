import type { PluginBranding } from './core/branding';

/**
 * AlphaInfo Drift Monitor — same engine as the suite's flagship, framed
 * for MLOps / data teams. Pain: models and features degrade quietly and
 * the team finds out late; "surface the anomaly before it becomes
 * downtime" polled at 92% approval in Grafana's 2026 Observability
 * Survey. The panel watches a model metric (score, latency, feature
 * statistic) and marks structural transitions as drift events.
 */
export const BRANDING: PluginBranding = {
  productName: 'AlphaInfo Drift Monitor',
  eventNoun: 'drift event',
  ctaSubtitle:
    'Watch a model metric for structural drift — catch degradation before it becomes an incident.',
  defaultDomain: 'ai_ml',
  testIdPrefix: 'alphainfo-drift',
};
