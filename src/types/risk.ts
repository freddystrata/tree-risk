export interface RiskItem {
  id: string;
  description: string;
  probability: number; // 1-5 scale, required
  impact: number; // 1-5 scale, required
  score: number; // calculated: probability * impact
  riskLevel: string; // derived from score
  mitigationEffectiveness: number; // 0-1 (0% to 100%), required
  residualScore: number; // calculated: score * (1 - mitigationEffectiveness)
  residualRiskLevel: string; // derived from residual score
  owner?: string;
  category?: string;
  project: string; // required: project association (dropdown)
  status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
  completionDate?: string;
  mitigationDate?: string;
  notes?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  causes?: string[];
  effects?: string[];
  rootCause?: boolean;
  // Financial Impact fields
  dollarImpact?: number; // optional: dollar value if risk happens
  impactType?: 'per_day' | 'lump_sum'; // optional: per day or lump sum
  impactDays?: number; // optional: number of days if per_day
  financialImpact?: number; // calculated: dollarImpact * impactDays (if per_day) or dollarImpact (if lump_sum)
  mitigationSavings?: number; // calculated: financialImpact - residualImpact
  residualImpact?: number; // calculated: financialImpact * (1 - mitigationEffectiveness)
  riskType: 'root_cause' | 'intermediate' | 'effect'; // required: for cause-effect diagram (dropdown)
  highPriority?: boolean; // optional: high priority checkbox
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