'use client';

import { useState, useMemo } from 'react';
import { RiskItem } from '@/types/risk';
import { exportCauseEffectToExcel } from '@/utils/excelExport';

interface CauseEffectTreeProps {
  risks: RiskItem[];
}

interface CauseEffectNode {
  id: string;
  risk: RiskItem;
  type: 'root_cause' | 'intermediate' | 'effect';
  x: number;
  y: number;
  level: number;
}

export default function CauseEffectTree({ risks }: CauseEffectTreeProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get unique projects
  const projects = useMemo(() => 
    [...new Set(risks.map(r => r.project).filter(Boolean))], [risks]);

  // Build cause-effect relationships for selected project
  const projectRisks = useMemo(() => 
    selectedProject ? risks.filter(r => r.project === selectedProject) : [], 
    [risks, selectedProject]);

  // Create cause-effect diagram structure
  const causeEffectData = useMemo(() => {
    if (!selectedProject || projectRisks.length === 0) return { nodes: [], connections: [] };

    const nodes: CauseEffectNode[] = [];
    const connections: Array<{from: string, to: string}> = [];
    
    // Categorize risks by type
    const rootCauses = projectRisks.filter(r => r.riskType === 'root_cause');
    const intermediateRisks = projectRisks.filter(r => r.riskType === 'intermediate');
    const effects = projectRisks.filter(r => r.riskType === 'effect');
    
    // Find the main effect (final impact)
    const mainEffect = effects.find(r => r.description.includes('COD Delayed')) || effects[0];
    
    // Position nodes in layers
    
    // Layer 3: Root Causes (left side)
    rootCauses.forEach((risk, index) => {
      const y = 100 + (index * 80);
      nodes.push({
        id: risk.id,
        risk,
        type: 'root_cause',
        x: 50,
        y,
        level: 0
      });
    });
    
    // Layer 2: Intermediate Risks (middle)
    intermediateRisks.forEach((risk, index) => {
      const y = 150 + (index * 120);
      nodes.push({
        id: risk.id,
        risk,
        type: 'intermediate',
        x: 300,
        y,
        level: 1
      });
    });
    
    // Layer 1: Final Effect (right side)
    if (mainEffect) {
      nodes.push({
        id: mainEffect.id,
        risk: mainEffect,
        type: 'effect',
        x: 550,
        y: 250,
        level: 2
      });
    }
    
    // Create connections based on the example structure
    // Root causes to intermediate risks
    const interconnectionCauses = ['Ambiguous Interconnection Agreement', 'Inexperienced Subcontractor'];
    const inspectionCauses = ['Late Permit from County', 'Change Order Not Approved', 'Missing Stamp'];
    const constructionCauses = ['Late Mobilization', 'Site Access Dispute', 'Crew Shortage', 'Port Congestion'];
    
    rootCauses.forEach(rootCause => {
      // Connect to appropriate intermediate risk
      if (interconnectionCauses.some(cause => rootCause.description.includes(cause))) {
        const interconnectionRisk = intermediateRisks.find(r => r.description.includes('Interconnection'));
        if (interconnectionRisk) {
          connections.push({ from: rootCause.id, to: interconnectionRisk.id });
        }
      }
      
      if (inspectionCauses.some(cause => rootCause.description.includes(cause))) {
        const inspectionRisk = intermediateRisks.find(r => r.description.includes('Inspection'));
        if (inspectionRisk) {
          connections.push({ from: rootCause.id, to: inspectionRisk.id });
        }
      }
      
      if (constructionCauses.some(cause => rootCause.description.includes(cause))) {
        const constructionRisk = intermediateRisks.find(r => r.description.includes('Construction') || r.description.includes('Port'));
        if (constructionRisk) {
          connections.push({ from: rootCause.id, to: constructionRisk.id });
        }
      }
    });
    
    // Intermediate risks to final effect
    if (mainEffect) {
      intermediateRisks.forEach(intermediate => {
        connections.push({ from: intermediate.id, to: mainEffect.id });
      });
    }
    
    return { nodes, connections };
  }, [projectRisks, selectedProject]);

  const handleExport = () => {
    if (selectedProject) {
      exportCauseEffectToExcel(projectRisks, selectedProject);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'root_cause': return '#ef4444'; // Red
      case 'intermediate': return '#f59e0b'; // Orange
      case 'effect': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getNodeLabel = (type: string) => {
    switch (type) {
      case 'root_cause': return 'Root Cause';
      case 'intermediate': return 'Risk Event';
      case 'effect': return 'Final Impact';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Cause-Effect Analysis</h2>
          {selectedProject && (
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Export to Excel
            </button>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project:
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a project...</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <p className="text-gray-600">
          This diagram shows how root causes lead to intermediate risks, which ultimately converge on the final impact.
          Each arrow represents a causal relationship between risk factors.
        </p>
      </div>

      {/* Cause-Effect Diagram */}
      {selectedProject && causeEffectData.nodes.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Cause-Effect Diagram: {selectedProject}
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <svg width="800" height="600" className="border rounded">
              {/* Connections (arrows) */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#374151"
                  />
                </marker>
              </defs>
              
              {causeEffectData.connections.map((connection, index) => {
                const fromNode = causeEffectData.nodes.find(n => n.id === connection.from);
                const toNode = causeEffectData.nodes.find(n => n.id === connection.to);
                
                if (!fromNode || !toNode) return null;
                
                return (
                  <line
                    key={index}
                    x1={fromNode.x + 120}
                    y1={fromNode.y + 25}
                    x2={toNode.x - 10}
                    y2={toNode.y + 25}
                    stroke="#374151"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              
              {/* Nodes */}
              {causeEffectData.nodes.map((node) => (
                <g key={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width="120"
                    height="50"
                    fill={getNodeColor(node.type)}
                    stroke="#374151"
                    strokeWidth="2"
                    rx="5"
                    className={`cursor-pointer transition-all ${
                      selectedNode === node.id ? 'opacity-80' : 'opacity-90'
                    } hover:opacity-100`}
                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  />
                  <text
                    x={node.x + 60}
                    y={node.y + 20}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {getNodeLabel(node.type)}
                  </text>
                  <text
                    x={node.x + 60}
                    y={node.y + 35}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                  >
                    {node.risk.description.substring(0, 15)}...
                  </text>
                </g>
              ))}
              
              {/* Layer Labels */}
              <text x="50" y="30" fill="#374151" fontSize="12" fontWeight="bold">
                Root Causes
              </text>
              <text x="300" y="30" fill="#374151" fontSize="12" fontWeight="bold">
                Intermediate Risks
              </text>
              <text x="550" y="30" fill="#374151" fontSize="12" fontWeight="bold">
                Final Effect
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Root Cause</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm">Risk Event</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Final Impact</span>
            </div>
          </div>
        </div>
      )}

      {/* Risk Details */}
      {selectedNode && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Details</h3>
          {(() => {
            const node = causeEffectData.nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{node.risk.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white`} 
                          style={{ backgroundColor: getNodeColor(node.type) }}>
                      {getNodeLabel(node.type)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Probability</label>
                    <p className="text-gray-900">{node.risk.probability}/5</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Impact</label>
                    <p className="text-gray-900">{node.risk.impact}/5</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Financial Impact</label>
                    <p className="text-gray-900">
                      {node.risk.financialImpact 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(node.risk.financialImpact)
                        : 'Not calculated'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mitigation Savings</label>
                    <p className="text-gray-900">
                      {node.risk.mitigationSavings 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(node.risk.mitigationSavings)
                        : 'Not calculated'
                      }
                    </p>
                  </div>
                </div>
                
                {node.risk.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900">{node.risk.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Instructions */}
      {!selectedProject && projects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Select a project above to view its cause-effect diagram. 
            Click on nodes to see detailed risk information.
          </p>
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            No projects found. Add project information to risks to see cause-effect analysis.
          </p>
        </div>
      )}
    </div>
  );
}