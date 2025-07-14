import { RiskItem, RiskLevel, RiskSummary, ProjectRiskSummary, RiskTimelineEntry } from '@/types/risk';

// Updated risk levels for 1-5 scale (max score 25) - one per level
export const RISK_LEVELS: RiskLevel[] = [
  { threshold: 1, name: "ACCEPTABLE", color: "bg-teal-200", textColor: "text-teal-800" },
  { threshold: 3, name: "VERY LOW", color: "bg-green-400", textColor: "text-green-800" },
  { threshold: 5, name: "LOW", color: "bg-yellow-300", textColor: "text-yellow-800" },
  { threshold: 8, name: "SIGNIFICANT", color: "bg-orange-400", textColor: "text-orange-800" },
  { threshold: 10, name: "HIGH", color: "bg-red-400", textColor: "text-red-100" },
  { threshold: 15, name: "VERY HIGH", color: "bg-red-600", textColor: "text-red-100" },
  { threshold: 20, name: "PROCEED AT YOUR OWN RISK", color: "bg-red-800", textColor: "text-red-100" },
];

/**
 * Risk Matrix for 1-5 scale
 * Probability (rows) × Impact (columns)
 */
export const RISK_MATRIX: number[][] = [
  [1, 2, 3, 4, 5],    // Probability 1
  [2, 4, 6, 8, 10],   // Probability 2
  [3, 6, 9, 12, 15],  // Probability 3
  [4, 8, 12, 16, 20], // Probability 4
  [5, 10, 15, 20, 25] // Probability 5
];

/**
 * Calculate risk score (Probability × Impact)
 */
export function calculateRiskScore(probability: number, impact: number): number {
  if (probability < 1 || probability > 5 || impact < 1 || impact > 5) {
    throw new Error('Probability and Impact must be between 1 and 5');
  }
  return RISK_MATRIX[probability - 1][impact - 1];
}

/**
 * Determine risk level based on score
 */
export function getRiskLevel(score: number): RiskLevel {
  // Find the highest threshold that the score meets or exceeds
  const sortedLevels = [...RISK_LEVELS].sort((a, b) => b.threshold - a.threshold);
  const level = sortedLevels.find(level => score >= level.threshold);
  
  // Default to lowest level if score is below all thresholds
  return level || RISK_LEVELS[0];
}

/**
 * Calculate residual risk score after mitigation
 */
export function calculateResidualScore(score: number, mitigationEffectiveness: number): number {
  return Math.round((score * (1 - mitigationEffectiveness)) * 10) / 10;
}

/**
 * Calculate all risk scores and levels for a risk item
 */
export function calculateRiskMetrics(
  probability: number, 
  impact: number, 
  mitigationEffectiveness: number = 0
): {
  score: number;
  riskLevel: string;
  residualScore: number;
  residualRiskLevel: string;
} {
  const score = calculateRiskScore(probability, impact);
  const riskLevel = getRiskLevel(score);
  const residualScore = calculateResidualScore(score, mitigationEffectiveness);
  const residualRiskLevel = getRiskLevel(residualScore);

  return {
    score,
    riskLevel: riskLevel.name,
    residualScore,
    residualRiskLevel: residualRiskLevel.name,
  };
}

/**
 * Generate a summary of risks by level and status
 */
export function generateRiskSummary(risks: RiskItem[]): RiskSummary {
  const byLevel: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byProject: Record<string, number> = {};

  // Initialize counters
  RISK_LEVELS.forEach(level => {
    byLevel[level.name] = 0;
  });

  risks.forEach(risk => {
    // Count by risk level
    byLevel[risk.riskLevel] = (byLevel[risk.riskLevel] || 0) + 1;
    
    // Count by status
    byStatus[risk.status] = (byStatus[risk.status] || 0) + 1;
    
    // Count by project
    if (risk.project) {
      byProject[risk.project] = (byProject[risk.project] || 0) + 1;
    }
  });

  return {
    total: risks.length,
    byLevel,
    byStatus,
    byProject,
  };
}

/**
 * Generate project-specific risk summary
 */
export function generateProjectRiskSummary(risks: RiskItem[], projectName: string): ProjectRiskSummary {
  const projectRisks = risks.filter(risk => risk.project === projectName);
  
  const highRisks = projectRisks.filter(risk => 
    ['HIGH', 'VERY HIGH', 'PROCEED AT YOUR OWN RISK'].includes(risk.riskLevel)
  ).length;
  
  const openRisks = projectRisks.filter(risk => 
    ['Open', 'In Progress'].includes(risk.status)
  ).length;
  
  const mitigatedRisks = projectRisks.filter(risk => 
    ['Mitigated', 'Closed'].includes(risk.status)
  ).length;
  
  const averageScore = projectRisks.length > 0 
    ? projectRisks.reduce((sum, risk) => sum + risk.score, 0) / projectRisks.length 
    : 0;
  
  // Simple trend calculation based on recent risks
  const recentRisks = projectRisks.filter(risk => {
    const riskDate = new Date(risk.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return riskDate > thirtyDaysAgo;
  });
  
  const riskTrend = recentRisks.length > projectRisks.length * 0.3 ? 'increasing' : 
                   recentRisks.length < projectRisks.length * 0.1 ? 'decreasing' : 'stable';
  
  // Profitability impact based on high-risk count and average score
  const expectedProfitabilityImpact = 
    highRisks > 3 || averageScore > 15 ? 'high' :
    highRisks > 1 || averageScore > 8 ? 'medium' : 'low';
  
  // Generate timeline
  const timeline: RiskTimelineEntry[] = projectRisks
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(risk => ({
      date: risk.createdAt,
      riskId: risk.id,
      event: 'created' as const,
      description: `Risk created: ${risk.description.substring(0, 50)}...`,
      riskLevel: risk.riskLevel
    }));
  
  // Add mitigation events
  projectRisks.forEach(risk => {
    if (risk.mitigationDate) {
      timeline.push({
        date: risk.mitigationDate,
        riskId: risk.id,
        event: 'mitigated',
        description: `Risk mitigated: ${risk.description.substring(0, 50)}...`,
        riskLevel: risk.residualRiskLevel
      });
    }
  });
  
  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    projectName,
    totalRisks: projectRisks.length,
    highRisks,
    openRisks,
    mitigatedRisks,
    averageScore: Math.round(averageScore * 10) / 10,
    riskTrend,
    expectedProfitabilityImpact,
    timeline: timeline.slice(-10) // Last 10 events
  };
}

/**
 * Validate risk probability and impact values (updated for 1-5 scale)
 */
export function validateRiskValues(probability: number, impact: number): string[] {
  const errors: string[] = [];

  if (probability < 1 || probability > 5) {
    errors.push('Probability must be between 1 and 5');
  }

  if (impact < 1 || impact > 5) {
    errors.push('Impact must be between 1 and 5');
  }

  return errors;
}

/**
 * Validate mitigation effectiveness
 */
export function validateMitigationEffectiveness(effectiveness: number): string[] {
  const errors: string[] = [];

  if (effectiveness < 0 || effectiveness > 1) {
    errors.push('Mitigation effectiveness must be between 0 and 1 (0% to 100%)');
  }

  return errors;
}

/**
 * Create a new risk item with calculated metrics
 */
export function createRiskItem(data: {
  description: string;
  probability: number;
  impact: number;
  mitigationEffectiveness?: number;
  owner?: string;
  category?: string;
  project?: string;
  status?: 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
  notes?: string;
  causes?: string[];
  effects?: string[];
  rootCause?: boolean;
}): Omit<RiskItem, 'id'> {
  const metrics = calculateRiskMetrics(
    data.probability, 
    data.impact, 
    data.mitigationEffectiveness || 0
  );

  const now = new Date().toISOString();

  return {
    description: data.description,
    probability: data.probability,
    impact: data.impact,
    mitigationEffectiveness: data.mitigationEffectiveness || 0,
    owner: data.owner,
    category: data.category,
    project: data.project,
    status: data.status || 'Open',
    notes: data.notes,
    causes: data.causes || [],
    effects: data.effects || [],
    rootCause: data.rootCause || false,
    createdAt: now,
    updatedAt: now,
    ...metrics,
  };
}