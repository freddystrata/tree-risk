'use client';

import { useMemo } from 'react';
import { RiskItem } from '@/types/risk';
import { generateRiskSummary, RISK_LEVELS } from '@/utils/riskCalculations';

interface RiskSummaryProps {
  risks: RiskItem[];
}

export default function RiskSummary({ risks }: RiskSummaryProps) {
  const summary = useMemo(() => generateRiskSummary(risks), [risks]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Mitigated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Dashboard Overview</h2>
        <div className="text-3xl font-bold text-blue-600">
          {summary.total} Total Risks
        </div>
      </div>

      {/* Risk Level Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution by Level</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {RISK_LEVELS.sort((a, b) => a.threshold - b.threshold).map(level => {
            const count = summary.byLevel[level.name] || 0;
            const percentage = summary.total > 0 ? (count / summary.total * 100).toFixed(1) : '0';
            
            return (
              <div
                key={level.name}
                className={`p-4 rounded-lg border-2 text-center ${level.color} ${level.textColor || 'text-gray-800'} min-h-[100px] flex flex-col justify-center`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium break-words">{level.name}</div>
                <div className="text-xs opacity-75">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary.byStatus).map(([status, count]) => {
            const percentage = summary.total > 0 ? (count / summary.total * 100).toFixed(1) : '0';
            
            return (
              <div
                key={status}
                className={`p-4 rounded-lg border-2 text-center ${getStatusColor(status)}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium">{status}</div>
                <div className="text-xs opacity-75">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High Priority Risks */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">High Priority Alert</h3>
        {(() => {
          const highRisks = risks.filter(risk => 
            ['HIGHEST', 'MEDIUM HIGH'].includes(risk.riskLevel) && 
            risk.status !== 'Closed'
          );
          
          if (highRisks.length === 0) {
            return (
              <div className="text-green-600 font-medium">
                ✅ No high-priority open risks
              </div>
            );
          }
          
          return (
            <div className="space-y-2">
              <div className="text-red-600 font-medium">
                ⚠️ {highRisks.length} high-priority risk(s) require attention
              </div>
              <div className="text-sm text-gray-600">
                Risks with HIGHEST or MEDIUM HIGH levels that are not closed
              </div>
            </div>
          );
        })()}
      </div>

      {/* Visual Risk Level Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
          {(() => {
            let currentPercent = 0;
            return RISK_LEVELS.map(level => {
              const count = summary.byLevel[level.name] || 0;
              const percentage = summary.total > 0 ? (count / summary.total * 100) : 0;
              const segmentStyle = {
                left: `${currentPercent}%`,
                width: `${percentage}%`,
              };
              currentPercent += percentage;
              
              return percentage > 0 ? (
                <div
                  key={level.name}
                  className={`absolute h-full ${level.color} flex items-center justify-center`}
                  style={segmentStyle}
                  title={`${level.name}: ${count} risks (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 10 && (
                    <span className={`text-xs font-medium ${level.textColor || 'text-gray-800'}`}>
                      {count}
                    </span>
                  )}
                </div>
              ) : null;
            });
          })()}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Mouse over segments for details
        </div>
      </div>
    </div>
  );
}