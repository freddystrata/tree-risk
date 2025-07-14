'use client';

import { useState, useMemo } from 'react';
import { RiskItem } from '@/types/risk';
import { generateProjectRiskSummary } from '@/utils/riskCalculations';
import { exportProjectSummaryToExcel } from '@/utils/excelExport';

interface ProjectAnalyticsProps {
  risks: RiskItem[];
}

export default function ProjectAnalytics({ risks }: ProjectAnalyticsProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Financial impact calculation helpers
  const calculateFinancialImpact = (riskScore: number, probability: number) => {
    const baseProjectValue = 500000; // $500K base project value
    const probabilityFactor = probability * 0.2; // Convert 1-5 scale to 0.2-1.0
    return riskScore * baseProjectValue * probabilityFactor * 0.01; // Scale down to reasonable amounts
  };

  const getImpactCategory = (amount: number) => {
    if (amount >= 150000) return 'high';
    if (amount >= 50000) return 'medium';
    return 'low';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get unique projects
  const projects = useMemo(() => 
    [...new Set(risks.map(r => r.project).filter(Boolean))], [risks]);

  // Generate project summaries with financial data
  const projectSummaries = useMemo(() => 
    projects.map(project => {
      const summary = generateProjectRiskSummary(risks, project!);
      const projectRisks = risks.filter(r => r.project === project);
      
      // Calculate total financial impact
      const totalFinancialImpact = projectRisks.reduce((sum, risk) => {
        return sum + calculateFinancialImpact(risk.score, risk.probability);
      }, 0);
      
      // Calculate potential savings from mitigation
      const mitigatedRisks = projectRisks.filter(r => r.status === 'Mitigated' || r.status === 'Closed');
      const potentialSavings = mitigatedRisks.reduce((sum, risk) => {
        const impact = calculateFinancialImpact(risk.score, risk.probability);
        return sum + (impact * (risk.mitigationEffectiveness || 0.7)); // Default 70% effectiveness
      }, 0);

      return {
        ...summary,
        totalFinancialImpact,
        potentialSavings,
        impactCategory: getImpactCategory(totalFinancialImpact)
      };
    }), [risks, projects]);

  const selectedProjectSummary = useMemo(() => 
    selectedProject ? projectSummaries.find(s => s.projectName === selectedProject) : null, 
    [projectSummaries, selectedProject]);

  const handleExportProjects = () => {
    exportProjectSummaryToExcel(projectSummaries, `project-risk-analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getRiskTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getProfitabilityColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Project Risk Analytics</h2>
        <button
          onClick={handleExportProjects}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Export Analytics
        </button>
      </div>

      {/* Profitability Impact Calculation Legend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Profitability Impact Calculation Legend</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">How We Calculate Financial Impact</h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-medium text-blue-900">Base Calculation:</div>
                <div className="text-blue-700">Financial Impact = Risk Score × Base Project Value × Probability Factor</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">Risk Score Range:</div>
                <div className="text-gray-700">1-25 (Probability × Impact, both on 1-5 scale)</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">Base Project Value:</div>
                <div className="text-gray-700">Estimated at $500K per project (industry average)</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">Probability Factor:</div>
                <div className="text-gray-700">0.1 to 1.0 based on risk probability (1=10%, 5=100%)</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Impact Categories</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="font-medium text-green-800">Low Impact</span>
                <span className="text-green-600">$0 - $50K</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="font-medium text-yellow-800">Medium Impact</span>
                <span className="text-yellow-600">$50K - $150K</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="font-medium text-red-800">High Impact</span>
                <span className="text-red-600">$150K+</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <div className="font-medium text-blue-900 mb-2">Mitigation Savings:</div>
              <div className="text-sm text-blue-700">
                Successful mitigation reduces potential financial impact by 60-90% depending on effectiveness.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectSummaries.map((summary) => (
          <div
            key={summary.projectName}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
              selectedProject === summary.projectName ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedProject(summary.projectName)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {summary.projectName}
              </h3>
              <span className="text-2xl">
                {getRiskTrendIcon(summary.riskTrend)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Risks:</span>
                <span className="font-medium">{summary.totalRisks}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">High Risks:</span>
                <span className={`font-medium ${summary.highRisks > 2 ? 'text-red-600' : 'text-gray-900'}`}>
                  {summary.highRisks}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Open/In Progress:</span>
                <span className="font-medium">{summary.openRisks}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Risk Score:</span>
                <span className="font-medium">{summary.averageScore}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Financial Impact:</span>
                <span className={`font-medium ${
                  summary.impactCategory === 'high' ? 'text-red-600' :
                  summary.impactCategory === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatCurrency(summary.totalFinancialImpact)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Potential Savings:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(summary.potentialSavings)}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Risk Category:</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProfitabilityColor(summary.expectedProfitabilityImpact)}`}>
                  {summary.expectedProfitabilityImpact.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Risk Trend: <span className="font-medium">{summary.riskTrend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Project View */}
      {selectedProjectSummary && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Detailed Analysis: {selectedProjectSummary.projectName}
          </h3>

          {/* Risk Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedProjectSummary.totalRisks}</div>
              <div className="text-sm text-blue-600">Total Risks</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{selectedProjectSummary.highRisks}</div>
              <div className="text-sm text-red-600">High Risk Items</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{selectedProjectSummary.openRisks}</div>
              <div className="text-sm text-yellow-600">Active Risks</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{selectedProjectSummary.mitigatedRisks}</div>
              <div className="text-sm text-green-600">Mitigated</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{formatCurrency(selectedProjectSummary.totalFinancialImpact)}</div>
              <div className="text-sm text-purple-600">Financial Impact</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-emerald-600">{formatCurrency(selectedProjectSummary.potentialSavings)}</div>
              <div className="text-sm text-emerald-600">Potential Savings</div>
            </div>
          </div>

          {/* Risk Trend Chart */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk & Financial Impact Trends</h4>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="relative h-64 bg-white rounded border">
                {/* Simple line chart simulation */}
                <div className="absolute inset-4">
                  <div className="h-full flex items-end justify-between">
                    {selectedProjectSummary.timeline.slice(-6).map((entry, index) => {
                      const projectRisks = risks.filter(r => r.project === selectedProjectSummary.projectName);
                      const monthlyImpact = projectRisks
                        .filter(r => new Date(r.createdAt).getMonth() === new Date(entry.date).getMonth())
                        .reduce((sum, risk) => sum + calculateFinancialImpact(risk.score, risk.probability), 0);
                      const height = Math.max(10, (monthlyImpact / selectedProjectSummary.totalFinancialImpact) * 200);
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-500 w-8 rounded-t"
                            style={{ height: `${height}px` }}
                            title={`${new Date(entry.date).toLocaleDateString()}: ${formatCurrency(monthlyImpact)}`}
                          ></div>
                          <div className="text-xs text-gray-500 mt-2 transform rotate-45">
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                </div>
                <div className="absolute top-2 left-4 text-sm text-gray-600">Financial Impact ($)</div>
                <div className="absolute bottom-2 right-4 text-sm text-gray-600">Timeline</div>
              </div>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span>Monthly Risk Impact</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Mitigated Risks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Timeline */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Timeline</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {selectedProjectSummary.timeline.length > 0 ? (
                <div className="space-y-3">
                  {selectedProjectSummary.timeline.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-md">
                      <div className="text-sm text-gray-500 min-w-[100px]">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.event === 'created' ? 'bg-blue-100 text-blue-800' :
                        entry.event === 'mitigated' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.event.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="flex-1 text-sm text-gray-700">
                        {entry.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.riskLevel}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No timeline data available for this project
                </div>
              )}
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Status Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Open', 'In Progress', 'Mitigated', 'Closed'].map(status => {
                const count = risks.filter(r => 
                  r.project === selectedProjectSummary.projectName && r.status === status
                ).length;
                const percentage = selectedProjectSummary.totalRisks > 0 
                  ? Math.round((count / selectedProjectSummary.totalRisks) * 100) 
                  : 0;
                
                return (
                  <div key={status} className="text-center">
                    <div className={`text-2xl font-bold ${
                      status === 'Open' ? 'text-red-600' :
                      status === 'In Progress' ? 'text-yellow-600' :
                      status === 'Mitigated' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-600">{status}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedProject && projects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Click on a project card above to view detailed analytics, 
            risk timeline, and mitigation status for that specific project.
          </p>
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            No projects found. Add project information to risks to see project-specific analytics.
          </p>
        </div>
      )}
    </div>
  );
}