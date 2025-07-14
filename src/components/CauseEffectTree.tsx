'use client';

import { useState, useMemo } from 'react';
import { RiskItem } from '@/types/risk';
import { exportCauseEffectToExcel } from '@/utils/excelExport';

interface CauseEffectTreeProps {
  risks: RiskItem[];
}

interface FishboneNode {
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRisk, setNewRisk] = useState({
    description: '',
    probability: 3,
    impact: 3,
    type: 'root_cause' as 'root_cause' | 'intermediate' | 'effect',
    parentId: ''
  });

  // Get unique projects
  const projects = useMemo(() => 
    [...new Set(risks.map(r => r.project).filter(Boolean))], [risks]);

  // Build cause-effect relationships for selected project
  const projectRisks = useMemo(() => 
    selectedProject ? risks.filter(r => r.project === selectedProject) : [], 
    [risks, selectedProject]);

  // Create fishbone diagram structure
  const fishboneData = useMemo(() => {
    if (!selectedProject || projectRisks.length === 0) return { nodes: [], mainSpine: null };

    const nodes: FishboneNode[] = [];
    const centerY = 250;
    const spineLength = 600;
    
    // Find the main effect (problem at the head of the fish)
    const mainEffect = projectRisks.find(r => 
      r.effects?.length === 0 || r.description.toLowerCase().includes('project') || r.impact >= 4
    ) || projectRisks[0];
    
    // Create main spine (horizontal line)
    const mainSpine = {
      start: { x: 50, y: centerY },
      end: { x: 50 + spineLength, y: centerY },
      head: { x: 50 + spineLength + 30, y: centerY }
    };

    // Categorize risks
    const rootCauses = projectRisks.filter(r => r.rootCause || (!r.causes?.length && r.effects?.length));
    const intermediates = projectRisks.filter(r => r.causes?.length && r.effects?.length);
    const effects = projectRisks.filter(r => r.causes?.length && !r.effects?.length && r.id !== mainEffect.id);

    // Position root causes on left side (bones)
    rootCauses.forEach((risk, index) => {
      const isTop = index % 2 === 0;
      const level = Math.floor(index / 2) + 1;
      const boneLength = 120 - level * 20;
      const xPos = 100 + level * 80;
      const yPos = centerY + (isTop ? -boneLength : boneLength);
      
      nodes.push({
        id: risk.id,
        risk,
        type: 'root_cause',
        x: xPos,
        y: yPos,
        level
      });
    });

    // Position intermediate causes
    intermediates.forEach((risk, index) => {
      const isTop = index % 2 === 0;
      const level = Math.floor(index / 2) + 1;
      const xPos = 250 + level * 60;
      const yPos = centerY + (isTop ? -60 - level * 20 : 60 + level * 20);
      
      nodes.push({
        id: risk.id,
        risk,
        type: 'intermediate',
        x: xPos,
        y: yPos,
        level
      });
    });

    // Position effects on right side
    effects.forEach((risk, index) => {
      const isTop = index % 2 === 0;
      const yPos = centerY + (isTop ? -40 - index * 20 : 40 + index * 20);
      
      nodes.push({
        id: risk.id,
        risk,
        type: 'effect',
        x: 500,
        y: yPos,
        level: 0
      });
    });

    // Add main effect at the head
    nodes.push({
      id: mainEffect.id,
      risk: mainEffect,
      type: 'effect',
      x: mainSpine.head.x,
      y: mainSpine.head.y,
      level: 0
    });

    return { nodes, mainSpine };
  }, [projectRisks, selectedProject]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleAddNewRisk = () => {
    // This would typically involve calling a parent component's function to add a new risk
    console.log('Adding new risk:', newRisk);
    setShowAddForm(false);
    setNewRisk({
      description: '',
      probability: 3,
      impact: 3,
      type: 'root_cause',
      parentId: ''
    });
  };

  const handleExportCauseEffect = () => {
    exportCauseEffectToExcel(risks, `cause-effect-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getNodeColor = (node: FishboneNode) => {
    const isSelected = selectedNode === node.id;
    const baseColor = 
      node.type === 'root_cause' ? 'bg-red-100 border-red-500 text-red-800' :
      node.type === 'intermediate' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
      'bg-blue-100 border-blue-500 text-blue-800';
    
    return `${baseColor} ${isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''}`;
  };

  const renderFishboneBones = () => {
    if (!fishboneData.mainSpine) return [];
    
    const bones: React.ReactElement[] = [];
    const centerY = fishboneData.mainSpine.start.y;
    
    fishboneData.nodes.forEach(node => {
      if (node.type === 'root_cause') {
        // Draw bone from main spine to root cause
        const spineX = 100 + node.level * 80 - 40; // Connection point on main spine
        bones.push(
          <g key={`bone-${node.id}`}>
            {/* Main bone line */}
            <line
              x1={spineX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="#374151"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
            {/* Small connecting line to spine */}
            <circle
              cx={spineX}
              cy={centerY}
              r="3"
              fill="#374151"
            />
          </g>
        );
      } else if (node.type === 'intermediate') {
        // Draw connection from intermediate to spine or other nodes
        bones.push(
          <line
            key={`connection-${node.id}`}
            x1={node.x}
            y1={node.y}
            x2={fishboneData.mainSpine.end.x - 100}
            y2={centerY}
            stroke="#6B7280"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
        );
      } else if (node.type === 'effect' && node.x < fishboneData.mainSpine.head.x) {
        // Draw connection from effect to main effect
        bones.push(
          <line
            key={`effect-${node.id}`}
            x1={node.x + 120}
            y1={node.y}
            x2={fishboneData.mainSpine.head.x - 50}
            y2={fishboneData.mainSpine.head.y}
            stroke="#2563EB"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      }
    });
    
    return bones;
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
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
          >
            + Add Risk Connection
          </button>
          <button
            onClick={handleExportCauseEffect}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Export Analysis
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
          {/* Fishbone Diagram */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Fishbone Diagram: {selectedProject}
            </h3>

            {fishboneData.nodes.length > 0 ? (
              <div className="relative overflow-auto bg-gray-50 rounded-lg p-4" style={{ minHeight: '500px' }}>
                <svg width="800" height="500" className="border border-gray-200 rounded bg-white">
                  {/* Define arrow markers */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                    </marker>
                  </defs>

                  {/* Main spine */}
                  {fishboneData.mainSpine && (
                    <g>
                      <line
                        x1={fishboneData.mainSpine.start.x}
                        y1={fishboneData.mainSpine.start.y}
                        x2={fishboneData.mainSpine.end.x}
                        y2={fishboneData.mainSpine.end.y}
                        stroke="#374151"
                        strokeWidth="4"
                      />
                      {/* Arrow head at the end */}
                      <polygon
                        points={`${fishboneData.mainSpine.head.x},${fishboneData.mainSpine.head.y} ${fishboneData.mainSpine.head.x - 20},${fishboneData.mainSpine.head.y - 10} ${fishboneData.mainSpine.head.x - 20},${fishboneData.mainSpine.head.y + 10}`}
                        fill="#374151"
                      />
                    </g>
                  )}

                  {/* Render fishbone bones and connections */}
                  {renderFishboneBones()}

                  {/* Render risk nodes */}
                  {fishboneData.nodes.map(node => (
                    <g key={node.id}>
                      <foreignObject x={node.x} y={node.y - 30} width="120" height="60">
                        <div
                          className={`p-2 rounded-lg border-2 shadow-md ${getNodeColor(node)} cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}
                          onClick={() => handleNodeClick(node.id)}
                          title={`${node.risk.description}\nScore: ${node.risk.score} (P:${node.risk.probability} × I:${node.risk.impact})\nStatus: ${node.risk.status}`}
                        >
                          <div className="text-xs font-semibold mb-1">
                            {node.type === 'root_cause' ? 'ROOT' : 
                             node.type === 'intermediate' ? 'INTER' : 'EFFECT'}
                          </div>
                          <div className="text-xs font-medium leading-tight">
                            {node.risk.description.substring(0, 25)}...
                          </div>
                          <div className="text-xs mt-1">
                            Score: {node.risk.score}
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  ))}
                </svg>
                
                {/* Instructions */}
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>How to read:</strong> Root causes (red) flow through intermediate risks (yellow) to create effects (blue). Click on any risk to highlight and see details.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No risks found for this project to create a fishbone diagram.</p>
                <p className="text-sm mt-2">
                  Add risks with different types (root causes, intermediate, effects) to see the visualization.
                </p>
              </div>
            )}
          </div>

          {/* Add New Risk Connection Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Risk Connection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Description</label>
                  <textarea
                    value={newRisk.description}
                    onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Describe the risk..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Type</label>
                  <select
                    value={newRisk.type}
                    onChange={(e) => setNewRisk({...newRisk, type: e.target.value as 'root_cause' | 'intermediate' | 'effect'})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="root_cause">Root Cause</option>
                    <option value="intermediate">Intermediate Risk</option>
                    <option value="effect">Effect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Probability (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.probability}
                    onChange={(e) => setNewRisk({...newRisk, probability: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Impact (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({...newRisk, impact: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewRisk}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Risk
                </button>
              </div>
            </div>
          )}

          {/* Selected Risk Details */}
          {selectedNode && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Details</h3>
              {(() => {
                const selectedRisk = fishboneData.nodes.find(n => n.id === selectedNode);
                if (!selectedRisk) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Risk Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Description:</strong> {selectedRisk.risk.description}</div>
                        <div><strong>Type:</strong> {selectedRisk.type.replace('_', ' ').toUpperCase()}</div>
                        <div><strong>Risk Score:</strong> {selectedRisk.risk.score} (P:{selectedRisk.risk.probability} × I:{selectedRisk.risk.impact})</div>
                        <div><strong>Status:</strong> {selectedRisk.risk.status}</div>
                        <div><strong>Owner:</strong> {selectedRisk.risk.owner || 'Unassigned'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Risk Relationships</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Causes:</strong> {selectedRisk.risk.causes?.length || 0} connected</div>
                        <div><strong>Effects:</strong> {selectedRisk.risk.effects?.length || 0} connected</div>
                        <div><strong>Mitigation:</strong> {((selectedRisk.risk.mitigationEffectiveness || 0) * 100).toFixed(0)}% effective</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Root Causes Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Root Causes Analysis</h3>
            
            {fishboneData.nodes.filter(n => n.type === 'root_cause').length > 0 ? (
              <div className="space-y-4">
                {fishboneData.nodes.filter(n => n.type === 'root_cause').map(rootNode => {
                  const effectCount = projectRisks.filter(r => r.causes?.includes(rootNode.id)).length;
                  
                                     return (
                     <div key={rootNode.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                       <div className="flex items-start justify-between mb-3">
                         <h4 className="font-semibold text-red-800">
                           {rootNode.risk.description}
                         </h4>
                         <span className="text-sm text-red-600 bg-red-200 px-2 py-1 rounded">
                           Root Cause
                         </span>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                         <div>
                           <span className="text-red-600 font-medium">Risk Score:</span>
                           <div>{rootNode.risk.score}</div>
                         </div>
                         <div>
                           <span className="text-red-600 font-medium">Direct Effects:</span>
                           <div>{effectCount}</div>
                         </div>
                         <div>
                           <span className="text-red-600 font-medium">Status:</span>
                           <div>{rootNode.risk.status}</div>
                         </div>
                         <div>
                           <span className="text-red-600 font-medium">Owner:</span>
                           <div>{rootNode.risk.owner || 'Unassigned'}</div>
                         </div>
                       </div>
                       
                       {rootNode.risk.effects && rootNode.risk.effects.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-red-200">
                           <div className="text-sm text-red-700 font-medium mb-2">
                             Directly Causes:
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {rootNode.risk.effects.map(effectId => {
                               const effectRisk = projectRisks.find(r => r.id === effectId);
                               return effectRisk ? (
                                 <span
                                   key={effectId}
                                   className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded cursor-pointer"
                                   title={effectRisk.description}
                                   onClick={() => handleNodeClick(effectId)}
                                 >
                                   {effectRisk.description.substring(0, 30)}...
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
            Fishbone Diagram: Cause-Effect Analysis
          </h3>
          <p className="text-blue-700 mb-4">
            This interactive fishbone diagram helps visualize how multiple root causes flow through intermediate risks to create final effects in your projects.
          </p>
          
          <div className="space-y-3 text-sm text-blue-700">
            <div>
              <strong>Example Flow:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Root Cause:</strong> Poor vendor communication → Specification misunderstandings</li>
                <li><strong>Intermediate Risk:</strong> Port congestion → Shipping delays</li>
                <li><strong>Final Effect:</strong> Combined issues → Project timeline delays → Revenue impact</li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <strong>How to Use:</strong>
              <ol className="list-decimal list-inside mt-2">
                <li>Select a project above to view its fishbone diagram</li>
                <li>Click on any risk node to view detailed information</li>
                <li>Use &quot;+ Add Risk Connection&quot; to add new risks and connections</li>
                <li>Export the analysis to Excel for reporting and documentation</li>
                <li>Use this to identify critical intervention points and root causes</li>
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