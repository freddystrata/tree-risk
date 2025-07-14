'use client';

import { RISK_LEVELS, RISK_MATRIX } from '@/utils/riskCalculations';

export default function RiskGuide() {
  const probabilityLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Critical'];
  const statusLabels = ['OPEN', 'CLOSED'];
  const realizedLabels = ['Y', 'N'];

  const getRiskLevelForScore = (score: number) => {
    const sortedLevels = [...RISK_LEVELS].sort((a, b) => b.threshold - a.threshold);
    const level = sortedLevels.find(level => score >= level.threshold);
    return level || RISK_LEVELS[0];
  };



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Scoring Guide</h2>
        <p className="text-gray-600">
          This guide explains how risk scores are calculated and what each risk level means. 
          Risk Score = Probability × Impact (1-5 scale each, maximum score = 25)
        </p>
      </div>

      {/* Risk Matrix Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Assessment Matrix</h3>
        
        {/* Probability and Impact Keys */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Probability Key</h4>
            <div className="space-y-2">
              {probabilityLabels.map((label, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{index + 1}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Impact Key</h4>
            <div className="space-y-2">
              {impactLabels.map((label, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{index + 1}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  PROBABILITY KEY
                </th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  IMPACT KEY
                </th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  STATUS
                </th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  REALIZED
                </th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold" colSpan={5}>
                  RATING MATRIX
                </th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  RATING_NC
                </th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  RATING_NAME
                </th>
              </tr>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                {impactLabels.map((label, index) => (
                  <th key={index} className="border border-gray-300 p-2 bg-gray-50 text-xs font-medium">
                    {index + 1}
                  </th>
                ))}
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody>
              {probabilityLabels.map((probLabel, probIndex) => (
                <tr key={probIndex}>
                  <td className="border border-gray-300 p-2 text-center font-medium">
                    {probIndex + 1}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {probLabel}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {statusLabels[probIndex % 2]}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {realizedLabels[probIndex % 2]}
                  </td>
                  
                  {RISK_MATRIX[probIndex].map((score, impactIndex) => {
                    const riskLevel = getRiskLevelForScore(score);
                    return (
                      <td 
                        key={impactIndex} 
                        className={`border border-gray-300 p-2 text-center font-bold ${riskLevel.color} ${riskLevel.textColor}`}
                      >
                        {score}
                      </td>
                    );
                  })}
                  
                  <td className="border border-gray-300 p-2 text-center">
                    {probIndex}
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-sm">
                    {probIndex === 0 ? 'ACCEPTABLE' : 
                     probIndex === 1 ? 'ACCEPTABLE' :
                     probIndex === 2 ? 'VERY LOW' :
                     probIndex === 3 ? 'VERY LOW' : 'LOW'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Level Legend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Level Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {RISK_LEVELS.map((level, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 text-center ${level.color} ${level.textColor || 'text-gray-800'}`}
            >
              <div className="text-lg font-bold">Score ≥ {level.threshold}</div>
              <div className="text-sm font-medium mt-2">{level.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Score Examples</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Sample Risk Calculations</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">Low Risk Example:</div>
                <div className="text-sm text-gray-600">Probability: 2 (Unlikely) × Impact: 2 (Minor) = Score: 4</div>
                <div className="text-sm">Risk Level: <span className="font-semibold text-green-800">VERY LOW</span></div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">Medium Risk Example:</div>
                <div className="text-sm text-gray-600">Probability: 3 (Possible) × Impact: 3 (Moderate) = Score: 9</div>
                <div className="text-sm">Risk Level: <span className="font-semibold text-orange-800">SIGNIFICANT</span></div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">High Risk Example:</div>
                <div className="text-sm text-gray-600">Probability: 4 (Likely) × Impact: 4 (Major) = Score: 16</div>
                <div className="text-sm">Risk Level: <span className="font-semibold text-red-100">VERY HIGH</span></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Risk Management Guidelines</h4>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded">
                <div className="font-medium text-green-800">ACCEPTABLE - VERY LOW (1-4)</div>
                <div className="text-sm text-green-700">Monitor periodically. Standard procedures apply.</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-800">LOW (5-7)</div>
                <div className="text-sm text-yellow-700">Regular monitoring. Consider mitigation if cost-effective.</div>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <div className="font-medium text-orange-800">SIGNIFICANT (8-9)</div>
                <div className="text-sm text-orange-700">Active management required. Implement mitigation strategies.</div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="font-medium text-red-800">HIGH - VERY HIGH (10-19)</div>
                <div className="text-sm text-red-700">Immediate attention required. Senior management involvement.</div>
              </div>
              <div className="p-3 bg-red-100 rounded">
                <div className="font-medium text-red-900">PROCEED AT YOUR OWN RISK (20-25)</div>
                <div className="text-sm text-red-800">Unacceptable. Must mitigate before proceeding.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}