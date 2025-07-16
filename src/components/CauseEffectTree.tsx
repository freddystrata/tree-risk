'use client';

import { useState, useMemo } from 'react';
import { RiskItem, CauseEffectNode } from '@/types/risk';
import { exportCauseEffectToExcel } from '@/utils/excelExport';

interface CauseEffectTreeProps {
  risks: RiskItem[];
}

export default function CauseEffectTree({ risks }: CauseEffectTreeProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Get unique projects
  const projects = useMemo(() => 
    [...new Set(risks.map(r => r.project).filter(Boolean))], [risks]);

  // Build cause-effect relationships for selected project
  const projectRisks = useMemo(() => 
    selectedProject ? risks.filter(r => r.project === selectedProject) : [], 
    [risks, selectedProject]);

  // Create cause-effect tree structure
  const causeEffectData = useMemo(() => {
    const nodes: Record<string, CauseEffectNode> = {};
    
    projectRisks.forEach((risk, index) => {
      nodes[risk.id] = {
        id: risk.id,
        riskId: risk.id,
        label: risk.description.substring(0, 40) + '...',
        description: risk.description,
        probability: risk.probability,
        impact: risk.impact,
        type: risk.rootCause ? 'root_cause' : 
              (risk.causes?.length && risk.effects?.length) ? 'intermediate' : 'effect',
        children: risk.effects || [],
        parents: risk.causes || [],
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 150
      };
    });

    return nodes;
  }, [projectRisks]);

  const rootCauses = useMemo(() => 
    Object.values(causeEffectData).filter(node => node.type === 'root_cause'),
    [causeEffectData]);

  const handleExportCauseEffect = () => {
    exportCauseEffectToExcel(risks, `cause-effect-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getNodeColor = (node: CauseEffectNode) => {
    switch (node.type) {
      case 'root_cause': return 'bg-red-100 border-red-500 text-red-800';
      case 'intermediate': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'effect': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const renderConnectionLines = () => {
    const lines: React.ReactElement[] = [];
    
    Object.values(causeEffectData).forEach(node => {
      node.children.forEach(childId => {
        const child = causeEffectData[childId];
        if (child) {
          lines.push(
            <line
              key={`${node.id}-${childId}`}
              x1={node.x + 120}
              y1={node.y + 30}
              x2={child.x}
              y2={child.y + 30}
              stroke="#6B7280"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        }
      });
    });
    
    return lines;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Cause-Effect Risk Tree</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleExportCauseEffect}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            📥 Export Analysis
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Risk Type Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-500 rounded mr-2"></div>
            <span className="text-sm">Root Cause</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Intermediate Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded mr-2"></div>
            <span className="text-sm">End Effect</span>
          </div>
        </div>
      </div>

      {selectedProject && (
        <>
          {/* Tree Visualization */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Risk Relationships: {selectedProject}
            </h3>

            {Object.keys(causeEffectData).length > 0 ? (
              <div className="relative overflow-auto" style={{ minHeight: '600px' }}>
                <svg width="100%" height="600" className="border border-gray-200 rounded">
                  {/* Define arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                    </marker>
                  </defs>

                  {/* Render connection lines */}
                  {renderConnectionLines()}

                  {/* Render nodes */}
                  {Object.values(causeEffectData).map(node => (
                    <g key={node.id}>
                      <foreignObject x={node.x} y={node.y} width="240" height="60">
                                                 <div
                           className={`p-3 rounded-lg border-2 shadow-md ${getNodeColor(node)} cursor-pointer hover:shadow-lg transition-shadow`}
                         >
                          <div className="text-xs font-semibold mb-1">
                            {node.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm font-medium truncate" title={node.description}>
                            {node.label}
                          </div>
                          {node.probability && node.impact && (
                            <div className="text-xs mt-1">
                              P:{node.probability} × I:{node.impact} = {node.probability * node.impact}
                            </div>
                          )}
                        </div>
                      </foreignObject>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No cause-effect relationships found for this project.</p>
                <p className="text-sm mt-2">
                  Add cause and effect relationships to risks to see the tree visualization.
                </p>
              </div>
            )}
          </div>

          {/* Root Causes Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Root Causes Analysis</h3>
            
            {rootCauses.length > 0 ? (
              <div className="space-y-4">
                {rootCauses.map(rootCause => {
                  const relatedRisk = projectRisks.find(r => r.id === rootCause.riskId);
                  const effectCount = rootCause.children.length;
                  
                  return (
                    <div key={rootCause.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-red-800">
                          {rootCause.description}
                        </h4>
                        <span className="text-sm text-red-600 bg-red-200 px-2 py-1 rounded">
                          Root Cause
                        </span>
                      </div>
                      
                      {relatedRisk && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-red-600 font-medium">Risk Score:</span>
                            <div>{relatedRisk.score}</div>
                          </div>
                          <div>
                            <span className="text-red-600 font-medium">Direct Effects:</span>
                            <div>{effectCount}</div>
                          </div>
                          <div>
                            <span className="text-red-600 font-medium">Status:</span>
                            <div>{relatedRisk.status}</div>
                          </div>
                          <div>
                            <span className="text-red-600 font-medium">Owner:</span>
                            <div>{relatedRisk.owner || 'Unassigned'}</div>
                          </div>
                        </div>
                      )}
                      
                      {rootCause.children.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <div className="text-sm text-red-700 font-medium mb-2">
                            Directly Causes:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {rootCause.children.map(childId => {
                              const childRisk = projectRisks.find(r => r.id === childId);
                              return childRisk ? (
                                <span
                                  key={childId}
                                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                                  title={childRisk.description}
                                >
                                  {childRisk.description.substring(0, 30)}...
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No root causes identified for this project.</p>
                <p className="text-sm mt-2">
                  Mark risks as root causes to see the analysis here.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Instructions */}
      {!selectedProject && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🌳 Solar/Battery Procurement Cause-Effect Example
          </h3>
          <p className="text-blue-700 mb-4">
            This fishbone tree helps visualize how multiple factors can cause cascading risks in procurement projects.
          </p>
          
          <div className="space-y-3 text-sm text-blue-700">
            <div>
              <strong>Example Flow:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Root Cause:</strong> Poor vendor communication → Specification misunderstandings</li>
                <li><strong>Contributing Factor:</strong> Port congestion → Shipping delays</li>
                <li><strong>Combined Effect:</strong> Both issues → Project timeline delays → Revenue impact</li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <strong>💡 How to Use:</strong>
              <ol className="list-decimal list-inside mt-2">
                <li>Select a project above to view its risk relationships</li>
                <li>Click on nodes to edit or add new connections</li>
                <li>Export the analysis to Excel for reporting</li>
                <li>Use this to identify critical intervention points</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            No projects with cause-effect relationships found. 
            Add risks with linked causes and effects to see the tree visualization.
          </p>
        </div>
      )}
    </div>
  );
}