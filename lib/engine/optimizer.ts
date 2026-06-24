import { Component, ConstraintSet } from '../data/schema';

export interface ScoredComponent {
  component: Component;
  score: number;
  reasons: string[];
}

export function optimizer(
  components: Component[],
  constraints: ConstraintSet
): ScoredComponent[] {
  const scored = components.map(comp => {
    const reasons: string[] = [];
    let score = 0;

    // 1. Power efficiency (0.4 weight)
    const sleepCurrent = comp.powerStates[0]?.currentMa ?? 0;
    const maxPowerState = Math.max(...comp.powerStates.map(p => p.currentMa));
    const powerEfficiency = 1 - Math.min(sleepCurrent / 0.1, 1);
    const powerScore = powerEfficiency * 0.4;
    if (powerScore > 0.2) {
      reasons.push(`Low power efficiency: ${(powerEfficiency * 100).toFixed(0)}%`);
    }
    score += powerScore;

    // 2. Price value (0.3 weight)
    const avgPrice = 500;
    const priceValue = Math.max(0, 1 - comp.priceCents / avgPrice);
    const priceScore = priceValue * 0.3;
    if (priceScore > 0.15) {
      reasons.push(`Good price value: $${(comp.priceCents / 100).toFixed(2)}`);
    }
    score += priceScore;

    // 3. Ecosystem maturity (0.2 weight)
    const matureityTags = ['nordic', 'arm-cortex', 'bosch', 'semtech'];
    const hasMaturityTag = comp.tags.some(tag =>
      matureityTags.some(mt => tag.toLowerCase().includes(mt))
    );
    const maturityScore = hasMaturityTag ? 0.2 : 0;
    if (maturityScore > 0) {
      reasons.push('Established ecosystem');
    }
    score += maturityScore;

    // 4. Tag relevance (0.1 weight)
    if (constraints.tags.length > 0) {
      const matchedTags = constraints.tags.filter(t => comp.tags.includes(t));
      const tagRelevance = matchedTags.length / Math.max(constraints.tags.length, 1);
      const tagScore = tagRelevance * 0.1;
      if (tagScore > 0) {
        reasons.push(`Tag match: ${matchedTags.join(', ')}`);
      }
      score += tagScore;
    }

    return {
      component: comp,
      score: Math.min(score, 1.0),
      reasons,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
