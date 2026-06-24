import { Component, ConstraintSet } from '../data/schema';

export interface ScoredComponent {
  component: Component;
  score: number;
  scoreBreakdown: {
    powerEfficiency: number;
    priceValue: number;
    ecosystemMaturity: number;
    tagRelevance: number;
  };
}

export function optimizer(
  components: Component[],
  constraints: ConstraintSet
): ScoredComponent[] {
  const scored = components.map(comp => {
    // Power efficiency — log-scale; 0mA sleep scores 1.0
    const minCurrentMa = Math.min(...comp.powerStates.map(s => s.currentMa));
    const powerEfficiency = Math.min(
      minCurrentMa === 0 ? 1.0 : 1 / (1 + Math.log10(1 + minCurrentMa)),
      1.0
    );

    // Price value — log-scale on dollars
    const priceValue = Math.min(
      comp.priceCents === 0 ? 1.0 : 1 / (1 + Math.log10(1 + comp.priceCents / 100)),
      1.0
    );

    // Ecosystem maturity — heuristic tag/data presence
    let maturity = 0;
    if (comp.tags.includes('arduino')) maturity += 0.3;
    if (comp.tags.includes('ultra-low-power')) maturity += 0.2;
    if (comp.compatibleWith.length > 2) maturity += 0.3;
    if (comp.datasheetUrl !== '') maturity += 0.2;
    const ecosystemMaturity = Math.min(maturity, 1.0);

    // Tag relevance — neutral 0.5 when no constraint tags
    const tagRelevance = constraints.tags.length === 0
      ? 0.5
      : Math.min(
          comp.tags.filter(t => constraints.tags.includes(t)).length /
            Math.max(constraints.tags.length, 1),
          1.0
        );

    const score =
      0.4 * powerEfficiency +
      0.3 * priceValue +
      0.2 * ecosystemMaturity +
      0.1 * tagRelevance;

    return {
      component: comp,
      score,
      scoreBreakdown: { powerEfficiency, priceValue, ecosystemMaturity, tagRelevance },
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
