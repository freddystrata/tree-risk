import { RiskItem } from '@/types/risk';
import { createRiskItem } from '@/utils/riskCalculations';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

const sampleRiskData = [
  // Solar Panel Procurement Project Risks
  {
    description: "Port congestion delays solar panel shipment from manufacturer",
    probability: 4,
    impact: 3,
    mitigationEffectiveness: 0.2,
    owner: "Supply Chain Manager",
    category: "Logistics",
    project: "Solar Panel Procurement Q1 2024",
    status: 'Open' as const,
    notes: "Monitoring port status daily, exploring alternative shipping routes",
    comments: "Port congestion has increased 40% this quarter. Consider air freight for critical components.",
    causes: ["supply-chain-risk-1", "logistics-risk-1"],
    effects: ["project-delay-1"],
    rootCause: false
  },
  {
    description: "Poor communication with solar panel vendor leading to specification misunderstandings",
    probability: 3,
    impact: 4,
    mitigationEffectiveness: 0.5,
    owner: "Project Manager",
    category: "Communication",
    project: "Solar Panel Procurement Q1 2024",
    status: 'In Progress' as const,
    notes: "Weekly vendor calls established, technical specifications documented",
    comments: "Previous project had specification issues costing $120K. Implementing structured communication protocol.",
    causes: [],
    effects: ["project-delay-1", "cost-overrun-1"],
    rootCause: true
  },
  {
    description: "Project timeline delay due to combined logistics and communication issues",
    probability: 4,
    impact: 4,
    mitigationEffectiveness: 0.3,
    owner: "Project Director",
    category: "Schedule",
    project: "Solar Panel Procurement Q1 2024",
    status: 'Open' as const,
    notes: "Contingency plans activated, stakeholder communication increased",
    comments: "Multiple dependencies creating compound risk. May need to adjust delivery timeline.",
    causes: ["supply-chain-risk-1", "communication-risk-1"],
    effects: ["revenue-loss-1"],
    rootCause: false
  },
  
  // Battery Storage Project Risks
  {
    description: "Battery supplier quality control issues affecting performance specifications",
    probability: 2,
    impact: 5,
    mitigationEffectiveness: 0.7,
    owner: "Quality Assurance Lead",
    category: "Quality",
    project: "Battery Storage System Q2 2024",
    status: 'Mitigated' as const,
    notes: "Enhanced QA process implemented, third-party testing required",
    comments: "Previous batch had 15% failure rate. New testing protocol reduces risk significantly.",
    mitigationDate: "2024-01-15T10:00:00Z"
  },
  {
    description: "Battery technology obsolescence during long procurement cycle",
    probability: 3,
    impact: 3,
    mitigationEffectiveness: 0.4,
    owner: "Technology Lead",
    category: "Technology",
    project: "Battery Storage System Q2 2024",
    status: 'Open' as const,
    notes: "Technology roadmap review scheduled quarterly",
    comments: "Battery tech evolving rapidly. Need to balance cutting-edge vs proven technology."
  },
  
  // Cross-Project Risks
  {
    description: "Key technical personnel departure affecting both solar and battery projects",
    probability: 2,
    impact: 4,
    mitigationEffectiveness: 0.6,
    owner: "HR Director",
    category: "Human Resources",
    project: "Solar Panel Procurement Q1 2024",
    status: 'In Progress' as const,
    notes: "Knowledge transfer sessions ongoing, backup personnel identified",
    comments: "Lost senior engineer last year. Implementing knowledge retention strategies."
  },
  {
    description: "Regulatory changes affecting renewable energy procurement standards",
    probability: 3,
    impact: 4,
    mitigationEffectiveness: 0.3,
    owner: "Compliance Officer",
    category: "Regulatory",
    project: "Battery Storage System Q2 2024",
    status: 'Open' as const,
    notes: "Monitoring regulatory developments, engaging industry associations",
    comments: "New environmental standards expected Q2. May impact component selection."
  },
  
  // Financial/Market Risks
  {
    description: "Currency fluctuation impacting international component costs",
    probability: 4,
    impact: 3,
    mitigationEffectiveness: 0.2,
    owner: "Finance Director",
    category: "Financial",
    project: "Solar Panel Procurement Q1 2024",
    status: 'Open' as const,
    notes: "Exploring currency hedging options",
    comments: "USD strengthening affecting procurement costs. 8% increase observed this quarter."
  },
  {
    description: "Market volatility affecting renewable energy investment funding",
    probability: 3,
    impact: 5,
    mitigationEffectiveness: 0.1,
    owner: "CFO",
    category: "Market",
    project: "Battery Storage System Q2 2024",
    status: 'Open' as const,
    notes: "Diversifying funding sources, securing letters of credit",
    comments: "Interest rates rising. Green energy funding becoming more competitive."
  }
];

export const SAMPLE_RISKS: RiskItem[] = sampleRiskData.map(data => ({
  id: generateId(),
  ...createRiskItem(data)
}));