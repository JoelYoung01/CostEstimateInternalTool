interface CostToolComposable {
  /**
   * @param squareFootage The square footage of the project.
   * @returns the project Tier based on the square footage of the project.
   */
  getProjectTier: (squareFootage: number) => ProjectTier | undefined;

  /**
   * @param kgbSqFt The square footage of the Kentucky Blue Grass portion of the project.
   * @param stSquareFootage The square footage of the St. Augustine portion of the project.
   * @returns the cost breakdown of the project.
   */
  getProjectCost: (kgbSqFt: number, stSquareFootage: number) => CostBreakdown;
}

interface ProjectTier {
  tier: number | null;
  maxSqFt: number;
  name: string;
  kbgCost?: number;
  stCost?: number;
}

interface CostBreakdown {
  kbgCost: number;
  stCost: number;
  totalCost: number;
}

export function useCostTools(): CostToolComposable {
  const tierList: ProjectTier[] = [
    { tier: null, name: "Too Small", maxSqFt: 100 },
    { tier: 0, name: "Custom Tier - Low End", maxSqFt: 500, kbgCost: 5, stCost: 6 },
    { tier: 1, name: "Tier 1", maxSqFt: 650, kbgCost: 4.1, stCost: 5.3 },
    { tier: 2, name: "Tier 2", maxSqFt: 890, kbgCost: 3.7, stCost: 4.6 },
    { tier: 3, name: "Tier 3", maxSqFt: 1250, kbgCost: 3.35, stCost: 3.95 },
    { tier: 4, name: "Tier 4", maxSqFt: 1850, kbgCost: 3.05, stCost: 3.45 },
    { tier: 5, name: "Tier 5", maxSqFt: 2500, kbgCost: 2.85, stCost: 3.1 },
    { tier: 6, name: "Tier 6", maxSqFt: 3500, kbgCost: 2.7, stCost: 2.85 },
    { tier: 7, name: "Tier 7", maxSqFt: 5000, kbgCost: 2.6, stCost: 2.7 },
    { tier: 8, name: "Custom Tier - High End", maxSqFt: 999999999, kbgCost: 2.3, stCost: 2.55 }
  ];

  const getProjectTier = (squareFootage: number) => {
    return tierList.find((tier) => squareFootage <= tier.maxSqFt);
  };

  const getProjectCost = (kgbSqFt: number, stSquareFootage: number) => {
    const tier = getProjectTier(kgbSqFt + stSquareFootage);

    const breakdown: CostBreakdown = {
      kbgCost: 0,
      stCost: 0,
      totalCost: 0
    };

    // If the project is too small return the breakdown without costs
    if (!tier || tier.tier === null) {
      return breakdown;
    }

    breakdown.kbgCost = kgbSqFt * (tier.kbgCost ?? 0);
    breakdown.stCost = stSquareFootage * (tier.stCost ?? 0);
    breakdown.totalCost = breakdown.kbgCost + breakdown.stCost;

    return breakdown;
  };

  return {
    getProjectTier,
    getProjectCost
  };
}
