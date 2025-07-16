'use client';

import { RISK_LEVELS, RISK_MATRIX } from '@/utils/riskCalculations';

export default function RiskGuide() {
  const probabilityLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Critical'];

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
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                  Probability
                </th>
                {impactLabels.map((label, index) => (
                  <th key={index} className="border border-gray-300 p-3 bg-gray-100 text-center font-semibold">
                    {index + 1}<br/><span className="text-xs font-normal">{label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {probabilityLabels.map((probLabel, probIndex) => (
                <tr key={probIndex}>
                  <td className="border border-gray-300 p-3 text-center font-medium bg-gray-50">
                    {probIndex + 1}<br/><span className="text-xs font-normal">{probLabel}</span>
                  </td>
                  
                  {RISK_MATRIX[probIndex].map((score, impactIndex) => {
                    const riskLevel = getRiskLevelForScore(score);
                    return (
                      <td 
                        key={impactIndex} 
                        className={`border border-gray-300 p-3 text-center font-bold ${riskLevel.color} ${riskLevel.textColor}`}
                      >
                        {score}
                      </td>
                    );
                  })}
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
            <div key={index} className={`p-4 rounded-lg border-2 ${level.color} ${level.textColor}`}>
              <div className="font-bold text-lg">{level.name}</div>
              <div className="text-sm mt-1">Score: {level.threshold}+</div>
              <div className="text-xs mt-2">
                {level.name === 'ACCEPTABLE' && 'Minimal risk, routine monitoring'}
                {level.name === 'VERY LOW' && 'Low risk, basic controls sufficient'}
                {level.name === 'LOW' && 'Moderate risk, standard mitigation'}
                {level.name === 'SIGNIFICANT' && 'Notable risk, enhanced controls needed'}
                {level.name === 'HIGH' && 'High risk, immediate attention required'}
                {level.name === 'VERY HIGH' && 'Critical risk, urgent action needed'}
                {level.name === 'PROCEED AT YOUR OWN RISK' && 'Extreme risk, consider project viability'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Impact Formula */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Impact Formula</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-lg font-semibold text-blue-900 mb-2">
            Financial Impact = (Dollar Effect per Unit) × (Exposure Units) × (Probability/5)
          </div>
          <div className="text-sm text-blue-700">
            <p><strong>Dollar Effect per Unit:</strong> e.g., $10,000/day delay, $500/MWh underproduced</p>
            <p><strong>Exposure Units:</strong> e.g., 20 days, 100 MWh, 10% tariff</p>
            <p><strong>Probability:</strong> Converted from 1-5 scale to 0.2-1.0 factor</p>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Example Calculations</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Risk</th>
                  <th className="border border-gray-300 p-2 text-left">Effect</th>
                  <th className="border border-gray-300 p-2 text-left">Value/Unit</th>
                  <th className="border border-gray-300 p-2 text-left">Exposure</th>
                  <th className="border border-gray-300 p-2 text-left">Probability</th>
                  <th className="border border-gray-300 p-2 text-left">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Delay in interconnection</td>
                  <td className="border border-gray-300 p-2">$/day revenue loss</td>
                  <td className="border border-gray-300 p-2">$15,000/day</td>
                  <td className="border border-gray-300 p-2">20 days</td>
                  <td className="border border-gray-300 p-2">0.5 (3/5)</td>
                  <td className="border border-gray-300 p-2 font-semibold">$150,000</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Module price tariff</td>
                  <td className="border border-gray-300 p-2">% price increase</td>
                  <td className="border border-gray-300 p-2">$100K/10%</td>
                  <td className="border border-gray-300 p-2">10%</td>
                  <td className="border border-gray-300 p-2">0.4 (2/5)</td>
                  <td className="border border-gray-300 p-2 font-semibold">$40,000</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Regulatory penalty</td>
                  <td className="border border-gray-300 p-2">Flat cost</td>
                  <td className="border border-gray-300 p-2">$250,000</td>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2">0.1 (0.5/5)</td>
                  <td className="border border-gray-300 p-2 font-semibold">$25,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-green-900 mb-2">Mitigation Savings</h4>
          <div className="text-sm text-green-700">
            <p><strong>Formula:</strong> Mitigation Savings = Original Impact - Residual Impact</p>
            <p><strong>Example:</strong> If mitigation reduces impact by 80%:</p>
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>Original Expected Impact: $150,000</li>
              <li>After mitigation: $30,000 (20% remaining)</li>
              <li>Savings: $120,000</li>
            </ul>
            <p className="mt-2"><strong>This helps justify the cost of risk controls and mitigation strategies.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}