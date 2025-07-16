'use client';

import { useState, useMemo } from 'react';
import { RiskItem } from '@/types/risk';
import { RISK_LEVELS } from '@/utils/riskCalculations';

interface RiskTableProps {
  risks: RiskItem[];
  onEditRisk?: (risk: RiskItem) => void;
  onDeleteRisk?: (riskId: string) => void;
  onUpdateStatus?: (riskId: string, status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed') => void;
}

type SortField = keyof RiskItem;
type SortDirection = 'asc' | 'desc';

export default function RiskTable({ risks, onEditRisk, onDeleteRisk, onUpdateStatus }: RiskTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => 
    [...new Set(risks.map(r => r.status))], [risks]);
  const uniqueCategories = useMemo(() => 
    [...new Set(risks.map(r => r.category).filter(Boolean))], [risks]);

  // Get risk level styling
  const getRiskLevelStyling = (level: string) => {
    const riskLevel = RISK_LEVELS.find(rl => rl.name === level);
    return riskLevel ? {
      background: riskLevel.color,
      text: riskLevel.textColor || 'text-gray-800'
    } : { background: 'bg-gray-200', text: 'text-gray-800' };
  };

  // Sort and filter risks
  const sortedAndFilteredRisks = useMemo(() => {
    let filtered = risks;

    // Apply filters
    if (filterLevel) {
      filtered = filtered.filter(risk => risk.riskLevel === filterLevel);
    }
    if (filterStatus) {
      filtered = filtered.filter(risk => risk.status === filterStatus);
    }
    if (filterCategory) {
      filtered = filtered.filter(risk => risk.category === filterCategory);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [risks, sortField, sortDirection, filterLevel, filterStatus, filterCategory]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return sortDirection === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Levels</option>
              {RISK_LEVELS.map(level => (
                <option key={level.name} value={level.name}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterLevel('');
                setFilterStatus('');
                setFilterCategory('');
              }}
              className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                Description <SortIcon field="description" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('probability')}
              >
                Probability <SortIcon field="probability" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('impact')}
              >
                Impact <SortIcon field="impact" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('score')}
              >
                Score <SortIcon field="score" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('riskLevel')}
              >
                Risk Level <SortIcon field="riskLevel" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('riskType')}
              >
                Risk Type <SortIcon field="riskType" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('residualScore')}
              >
                Residual Score <SortIcon field="residualScore" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('residualRiskLevel')}
              >
                Residual Level <SortIcon field="residualRiskLevel" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('owner')}
              >
                Owner <SortIcon field="owner" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('comments')}
              >
                Comments/Lessons <SortIcon field="comments" />
              </th>
              {(onEditRisk || onDeleteRisk || onUpdateStatus) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredRisks.map((risk) => {
              const riskLevelStyle = getRiskLevelStyling(risk.riskLevel);
              const residualLevelStyle = getRiskLevelStyling(risk.residualRiskLevel);
              
              return (
                <tr key={risk.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={risk.description}>
                      {risk.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {risk.probability}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {risk.impact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {risk.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevelStyle.background} ${riskLevelStyle.text}`}>
                      {risk.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {risk.riskType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {risk.residualScore.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${residualLevelStyle.background} ${residualLevelStyle.text}`}>
                      {risk.residualRiskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {risk.owner || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {onUpdateStatus ? (
                      <select
                        value={risk.status}
                        onChange={(e) => onUpdateStatus(risk.id, e.target.value as 'Open' | 'In Progress' | 'Mitigated' | 'Closed')}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                          risk.status === 'Open' ? 'bg-red-100 text-red-800' :
                          risk.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          risk.status === 'Mitigated' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Mitigated">Mitigated</option>
                        <option value="Closed">Closed</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.status === 'Open' ? 'bg-red-100 text-red-800' :
                        risk.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        risk.status === 'Mitigated' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={risk.comments || 'No comments'}>
                      {risk.comments || '-'}
                    </div>
                  </td>
                  {(onEditRisk || onDeleteRisk || onUpdateStatus) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {onEditRisk && (
                          <button
                            onClick={() => onEditRisk(risk)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {onDeleteRisk && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this risk?')) {
                                onDeleteRisk(risk.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredRisks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No risks found matching the current filters.
        </div>
      )}
    </div>
  );
}