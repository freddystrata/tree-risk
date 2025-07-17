export interface RiskItem {
  id: string;
  description: string;
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  score: number; // calculated: probability * impact
  riskLevel: string; // derived from score
  mitigationEffectiveness: number; // 0-1 (0% to 100%)
  residualScore: number; // calculated: score * (1 - mitigationEffectiveness)
  residualRiskLevel: string; // derived from residual score
  owner?: string;
  category?: string;
  project?: string; // New: project association
  status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
  completionDate?: string;
  mitigationDate?: string; // New: when mitigation was implemented
  notes?: string;
  comments?: string; // Comments/lessons learned
  createdAt: string;
  updatedAt: string;
  // New: Cause-effect relationships
  causes?: string[]; // IDs of risks that cause this risk
  effects?: string[]; // IDs of risks that this risk causes
  rootCause?: boolean; // Is this a root cause
  // New: Financial Impact Formula fields
  dollarEffectPerUnit?: number; // e.g., $10,000 per day, $500 per MWh
  exposureUnits?: number; // e.g., 20 days, 100 MWh, 10% tariff
  exposureUnitType?: string; // e.g., "days", "MWh", "% tariff"
  financialImpact?: number; // calculated: dollarEffectPerUnit × exposureUnits × (probability/5)
  mitigationSavings?: number; // calculated: original impact - residual impact
  riskType?: 'root_cause' | 'intermediate' | 'effect'; // For cause-effect diagram
  highPriority?: boolean; // New: high priority flag
  projectType?: string; // New: type of risk (dropdown)
  dollarImpact?: number; // New: dollar value if risk happens
  impactType?: 'per_day' | 'lump_sum'; // New: impact type
}

export interface RiskLevel {
  threshold: number;
  name: string;
  color: string;
  textColor?: string;
}

export interface RiskSummary {
  total: number;
  byLevel: Record<string, number>;
  byStatus: Record<string, number>;
  byProject?: Record<string, number>; // New: project-based summary
}

export interface ImportResult {
  success: boolean;
  risks: RiskItem[];
  errors: string[];
}

// New: Project-specific risk metrics
export interface ProjectRiskSummary {
  projectName: string;
  totalRisks: number;
  highRisks: number;
  openRisks: number;
  mitigatedRisks: number;
  averageScore: number;
  riskTrend: 'increasing' | 'decreasing' | 'stable';
  expectedProfitabilityImpact: 'low' | 'medium' | 'high';
  timeline: RiskTimelineEntry[];
}

export interface RiskTimelineEntry {
  date: string;
  riskId: string;
  event: 'created' | 'mitigated' | 'status_changed';
  description: string;
  riskLevel: string;
}

// New: Cause-effect tree structure
export interface CauseEffectNode {
  id: string;
  riskId?: string; // Links to actual risk item
  label: string;
  description: string;
  probability?: number;
  impact?: number;
  type: 'root_cause' | 'intermediate' | 'effect';
  children: string[]; // IDs of child nodes
  parents: string[]; // IDs of parent nodes
  x: number; // Position for diagram
  y: number;
}

export interface CauseEffectTree {
  id: string;
  name: string;
  project: string;
  description: string;
  nodes: Record<string, CauseEffectNode>;
  rootNodes: string[]; // Root cause node IDs
  createdAt: string;
  updatedAt: string;
}