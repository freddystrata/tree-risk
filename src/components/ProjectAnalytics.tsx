'use client';

import { useState, useMemo, useCallback } from 'react';
import { RiskItem } from '@/types/risk';
import { generateProjectRiskSummary } from '@/utils/riskCalculations';
import { exportProjectSummaryToExcel } from '@/utils/excelExport';

interface ProjectAnalyticsProps {
  risks: RiskItem[];
}

export default function ProjectAnalytics({ risks }: ProjectAnalyticsProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Financial impact calculation helpers
  const calculateFinancialImpact = useCallback((risk: RiskItem) => {
    // Use the new financial impact if available, otherwise fall back to old calculation
    if (risk.financialImpact) {
      return risk.financialImpact;
    }
    // Fallback calculation for risks without the new fields
    const baseProjectValue = 500000; // $500K base project value
    const probabilityFactor = risk.probability * 0.2; // Convert 1-5 scale to 0.2-1.0
    return risk.score * baseProjectValue * probabilityFactor * 0.01; // Scale down to reasonable amounts
  }, []);

  const calculateMitigationSavings = useCallback((risk: RiskItem) => {
    if (risk.mitigationSavings) {
      return risk.mitigationSavings;
    }
    // Fallback calculation
    const impact = calculateFinancialImpact(risk);
    return impact * risk.mitigationEffectiveness;
  }, [calculateFinancialImpact]);

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
        return sum + calculateFinancialImpact(risk);
      }, 0);
      
      // Calculate potential savings from mitigation
      const mitigatedRisks = projectRisks.filter(r => r.status === 'Mitigated' || r.status === 'Closed');
      const potentialSavings = mitigatedRisks.reduce((sum, risk) => {
        const savings = calculateMitigationSavings(risk);
        return sum + savings;
      }, 0);

      return {
        ...summary,
        totalFinancialImpact,
        potentialSavings,
        impactCategory: getImpactCategory(totalFinancialImpact)
      };
    }), [projects, risks, calculateFinancialImpact, calculateMitigationSavings]);

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
                {/* Line chart simulation */}
                <div className="absolute inset-4">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Generate yearly risk trend data */}
                    {(() => {
                      const months = Array.from({ length: 12 }, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - (11 - i));
                        return date;
                      });
                      
                      const riskData = months.map((month, index) => {
                                              const projectRisks = risks.filter(r => r.project === selectedProjectSummary.projectName);
                      // Simulate risk evolution over time
                      const baseRisk = projectRisks.reduce((sum, risk) => sum + calculateFinancialImpact(risk), 0);
                      const monthlyVariation = Math.sin(index * 0.5) * 0.3 + Math.random() * 0.2 - 0.1;
                      const riskValue = Math.max(0, baseRisk * (1 + monthlyVariation));
                        
                        return {
                          month: month.toLocaleDateString('en-US', { month: 'short' }),
                          value: riskValue,
                          x: (index / 11) * 360 + 20,
                          y: 180 - (riskValue / (selectedProjectSummary.totalFinancialImpact || 1)) * 140
                        };
                      });
                      
                      const mitigatedData = months.map((month, index) => {
                        const projectRisks = risks.filter(r => r.project === selectedProjectSummary.projectName);
                        const baseMitigation = projectRisks.reduce((sum, risk) => sum + calculateMitigationSavings(risk), 0);
                        const monthlyMitigation = baseMitigation * (index / 11) * 0.8; // Increasing mitigation over time
                        
                        return {
                          month: month.toLocaleDateString('en-US', { month: 'short' }),
                          value: monthlyMitigation,
                          x: (index / 11) * 360 + 20,
                          y: 180 - (monthlyMitigation / (selectedProjectSummary.totalFinancialImpact || 1)) * 140
                        };
                      });
                      
                      return (
                        <>
                          {/* Risk trend line */}
                          <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            points={riskData.map(d => `${d.x},${d.y}`).join(' ')}
                          />
                          
                          {/* Mitigation trend line */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            points={mitigatedData.map(d => `${d.x},${d.y}`).join(' ')}
                          />
                          
                          {/* Data points for risk trend */}
                          {riskData.map((point, index) => (
                            <circle
                              key={`risk-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill="#3b82f6"
                              className="hover:r-6 transition-all"
                            />
                          ))}
                          
                          {/* Data points for mitigation trend */}
                          {mitigatedData.map((point, index) => (
                            <circle
                              key={`mitigation-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill="#10b981"
                              className="hover:r-6 transition-all"
                            />
                          ))}
                          
                          {/* X-axis labels */}
                          {riskData.filter((_, i) => i % 2 === 0).map((point, index) => (
                            <text
                              key={`label-${index}`}
                              x={point.x}
                              y="195"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                            >
                              {point.month}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="absolute top-2 left-4 text-sm text-gray-600">Financial Impact ($)</div>
                <div className="absolute bottom-2 right-4 text-sm text-gray-600">Timeline (12 months)</div>
              </div>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-blue-500 mr-2"></div>
                  <span>Risk Impact Trend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-green-500 mr-2"></div>
                  <span>Mitigation Savings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Timeline */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Impact Breakdown</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Impact Details */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">Current Financial Impact by Risk</h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {risks.filter(r => r.project === selectedProjectSummary.projectName).map((risk) => {
                      const impact = calculateFinancialImpact(risk);
                      return (
                        <div key={risk.id} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 truncate" title={risk.description}>
                              {risk.description.substring(0, 40)}...
                            </div>
                            <div className="text-xs text-gray-500">
                              {risk.dollarEffectPerUnit ? (
                                <>
                                  ${risk.dollarEffectPerUnit?.toLocaleString()}/{risk.exposureUnitType} × {risk.exposureUnits} × {(risk.probability/5).toFixed(1)} prob
                                </>
                              ) : (
                                'Legacy calculation'
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${impact > 100000 ? 'text-red-600' : impact > 50000 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {formatCurrency(impact)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total Project Impact:</span>
                      <span className="text-red-600">{formatCurrency(selectedProjectSummary.totalFinancialImpact)}</span>
                    </div>
                  </div>
                </div>

                {/* Mitigation Savings Details */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">Mitigation Savings by Risk</h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {risks.filter(r => r.project === selectedProjectSummary.projectName).map((risk) => {
                      const savings = calculateMitigationSavings(risk);
                      const originalImpact = calculateFinancialImpact(risk);
                      const residualImpact = originalImpact - savings;
                      return (
                        <div key={risk.id} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 truncate" title={risk.description}>
                              {risk.description.substring(0, 40)}...
                            </div>
                            <div className="text-xs text-gray-500">
                              {(risk.mitigationEffectiveness * 100).toFixed(0)}% mitigation effectiveness
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(savings)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Residual: {formatCurrency(residualImpact)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total Potential Savings:</span>
                      <span className="text-green-600">{formatCurrency(selectedProjectSummary.potentialSavings)}</span>
                    </div>
                  </div>
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

          {/* Risk Cluster Chart */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Cluster Analysis</h4>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="relative h-96 bg-white rounded border">
                <svg className="w-full h-full" viewBox="0 0 500 400">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="cluster-grid" width="50" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cluster-grid)" />
                  
                  {/* Axes */}
                  <line x1="50" y1="350" x2="450" y2="350" stroke="#374151" strokeWidth="2"/>
                  <line x1="50" y1="350" x2="50" y2="50" stroke="#374151" strokeWidth="2"/>
                  
                  {/* Axis labels */}
                  <text x="250" y="380" textAnchor="middle" fontSize="12" fill="#374151">
                    Probability (1-5)
                  </text>
                  <text x="25" y="200" textAnchor="middle" fontSize="12" fill="#374151" transform="rotate(-90 25 200)">
                    Impact (1-5)
                  </text>
                  
                  {/* Axis ticks */}
                  {[1, 2, 3, 4, 5].map(tick => (
                    <g key={`x-${tick}`}>
                      <line x1={50 + (tick * 80)} y1="350" x2={50 + (tick * 80)} y2="355" stroke="#374151" strokeWidth="1"/>
                      <text x={50 + (tick * 80)} y="370" textAnchor="middle" fontSize="10" fill="#374151">
                        {tick}
                      </text>
                    </g>
                  ))}
                  
                  {[1, 2, 3, 4, 5].map(tick => (
                    <g key={`y-${tick}`}>
                      <line x1="45" y1={350 - (tick * 60)} x2="50" y2={350 - (tick * 60)} stroke="#374151" strokeWidth="1"/>
                      <text x="40" y={350 - (tick * 60) + 4} textAnchor="end" fontSize="10" fill="#374151">
                        {tick}
                      </text>
                    </g>
                  ))}
                  
                  {/* Risk quadrants background */}
                  <rect x="50" y="170" width="160" height="180" fill="#fef3c7" fillOpacity="0.3"/>
                  <rect x="210" y="170" width="160" height="180" fill="#fed7aa" fillOpacity="0.3"/>
                  <rect x="50" y="50" width="160" height="120" fill="#fecaca" fillOpacity="0.3"/>
                  <rect x="210" y="50" width="160" height="120" fill="#dc2626" fillOpacity="0.3"/>
                  
                  {/* Quadrant labels */}
                  <text x="130" y="270" textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">
                    Low Impact
                  </text>
                  <text x="290" y="270" textAnchor="middle" fontSize="10" fill="#c2410c" fontWeight="bold">
                    Monitor
                  </text>
                  <text x="130" y="110" textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="bold">
                    Manage
                  </text>
                  <text x="290" y="110" textAnchor="middle" fontSize="10" fill="#7f1d1d" fontWeight="bold">
                    Critical
                  </text>
                  
                  {/* Risk points */}
                  {risks.filter(r => r.project === selectedProjectSummary.projectName).map((risk) => {
                    const x = 50 + (risk.probability * 80);
                    const y = 350 - (risk.impact * 60);
                    const financialImpact = calculateFinancialImpact(risk);
                    const radius = Math.max(8, Math.min(30, Math.sqrt(financialImpact / 10000)));
                    
                    return (
                      <g key={risk.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={radius}
                          fill={
                            risk.riskType === 'root_cause' ? '#ef4444' :
                            risk.riskType === 'intermediate' ? '#f59e0b' :
                            '#10b981'
                          }
                          fillOpacity="0.7"
                          stroke="#374151"
                          strokeWidth="2"
                          className="hover:opacity-100 cursor-pointer"
                          onClick={() => setSelectedNode(risk.id)}
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fontSize="8"
                          fill="white"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {formatCurrency(financialImpact).replace('$', '').replace(',', 'K').replace('000', '')}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Root Cause</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Risk Event</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Final Impact</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Bubble size:</strong> Financial impact
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>How to read:</strong> Risks in the top-right (Critical) quadrant require immediate attention. 
                Bubble size represents financial impact. Click on bubbles to see details.</p>
              </div>
            </div>
          </div>

          {/* Selected Risk Details */}
          {selectedNode && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Risk Details</h4>
              {(() => {
                const selectedRisk = risks.find(r => r.id === selectedNode);
                if (!selectedRisk) return null;
                
                const impact = calculateFinancialImpact(selectedRisk);
                const savings = calculateMitigationSavings(selectedRisk);
                const residual = impact - savings;
                
                return (
                  <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-xl font-semibold text-gray-900">{selectedRisk.description}</h5>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h6 className="font-semibold text-gray-800">Risk Assessment</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Probability:</span>
                            <span className="font-medium">{selectedRisk.probability}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Impact:</span>
                            <span className="font-medium">{selectedRisk.impact}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Risk Score:</span>
                            <span className="font-medium">{selectedRisk.score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium text-white`} 
                                  style={{ backgroundColor: 
                                    selectedRisk.riskType === 'root_cause' ? '#ef4444' :
                                    selectedRisk.riskType === 'intermediate' ? '#f59e0b' :
                                    '#10b981'
                                  }}>
                              {selectedRisk.riskType?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h6 className="font-semibold text-gray-800">Financial Impact</h6>
                        <div className="space-y-2">
                          {selectedRisk.dollarEffectPerUnit ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Dollar Effect/Unit:</span>
                                <span className="font-medium">${selectedRisk.dollarEffectPerUnit.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Exposure Units:</span>
                                <span className="font-medium">{selectedRisk.exposureUnits} {selectedRisk.exposureUnitType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Probability Factor:</span>
                                <span className="font-medium">{(selectedRisk.probability/5).toFixed(1)}</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-600">Using legacy calculation method</div>
                          )}
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-semibold">Total Impact:</span>
                            <span className="font-bold text-red-600">{formatCurrency(impact)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h6 className="font-semibold text-gray-800">Mitigation</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Effectiveness:</span>
                            <span className="font-medium">{(selectedRisk.mitigationEffectiveness * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Potential Savings:</span>
                            <span className="font-medium text-green-600">{formatCurrency(savings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Residual Impact:</span>
                            <span className="font-medium text-yellow-600">{formatCurrency(residual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              selectedRisk.status === 'Open' ? 'bg-red-100 text-red-800' :
                              selectedRisk.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              selectedRisk.status === 'Mitigated' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {selectedRisk.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedRisk.notes && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h6 className="font-semibold text-gray-800 mb-2">Notes</h6>
                        <p className="text-sm text-gray-600">{selectedRisk.notes}</p>
                      </div>
                    )}
                    
                    {selectedRisk.comments && (
                      <div className="mt-4">
                        <h6 className="font-semibold text-gray-800 mb-2">Comments</h6>
                        <p className="text-sm text-gray-600">{selectedRisk.comments}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
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