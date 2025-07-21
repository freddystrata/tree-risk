'use client';

import { useState, useEffect } from 'react';
import { RiskItem } from '@/types/risk';
import { calculateRiskMetrics } from '@/utils/riskCalculations';

interface RiskFormProps {
  risk?: RiskItem | null; // null for new risk, RiskItem for editing
  onSave: (risk: Omit<RiskItem, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function RiskForm({ risk, onSave, onCancel, isOpen }: RiskFormProps) {
  const [formData, setFormData] = useState<{
    description: string;
    probability: string; // allow blank, validate as 1-5
    impact: string; // allow blank, validate as 1-5
    mitigationEffectiveness: string; // allow blank, validate as 0-100
    owner: string;
    category: string;
    status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
    notes: string;
    comments: string;
    project: string;
    riskType: 'root_cause' | 'intermediate' | 'effect' | '';
    dollarImpact: string;
    impactType: 'per_day' | 'lump_sum';
    impactDays: string;
    highPriority: boolean;
  }>({
    description: '',
    probability: '',
    impact: '',
    mitigationEffectiveness: '',
    owner: '',
    category: '',
    status: 'In Progress',
    notes: '',
    comments: '',
    project: '',
    riskType: '',
    dollarImpact: '',
    impactType: 'lump_sum',
    impactDays: '',
    highPriority: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when risk prop changes
  useEffect(() => {
    if (risk) {
      setFormData({
        description: risk.description,
        probability: risk.probability ? String(risk.probability) : '',
        impact: risk.impact ? String(risk.impact) : '',
        mitigationEffectiveness: risk.mitigationEffectiveness !== undefined ? String(Math.round(risk.mitigationEffectiveness * 100)) : '',
        owner: risk.owner || '',
        category: risk.category || '',
        status: risk.status,
        notes: risk.notes || '',
        comments: risk.comments || '',
        project: risk.project || '',
        riskType: risk.riskType || '',
        dollarImpact: risk.dollarImpact !== undefined ? String(risk.dollarImpact) : '',
        impactType: risk.impactType || 'lump_sum',
        impactDays: risk.impactDays !== undefined ? String(risk.impactDays) : '',
        highPriority: !!risk.highPriority,
      });
    } else {
      setFormData({
        description: '',
        probability: '',
        impact: '',
        mitigationEffectiveness: '',
        owner: '',
        category: '',
        status: 'In Progress',
        notes: '',
        comments: '',
        project: '',
        riskType: '',
        dollarImpact: '',
        impactType: 'lump_sum',
        impactDays: '',
        highPriority: false,
      });
    }
    setErrors([]);
  }, [risk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors: string[] = [];
    if (!formData.description.trim()) {
      validationErrors.push('Description is required');
    }
    // Validate probability and impact
    const prob = Number(formData.probability);
    const imp = Number(formData.impact);
    if (!formData.probability || isNaN(prob) || prob < 1 || prob > 5) {
      validationErrors.push('Probability must be a number between 1 and 5');
    }
    if (!formData.impact || isNaN(imp) || imp < 1 || imp > 5) {
      validationErrors.push('Impact must be a number between 1 and 5');
    }
    // Validate mitigation effectiveness
    const mitEff = Number(formData.mitigationEffectiveness);
    if (formData.mitigationEffectiveness === '' || isNaN(mitEff) || mitEff < 0 || mitEff > 100) {
      validationErrors.push('Mitigation Effectiveness must be a number between 0 and 100');
    }
    // Validate required dropdowns
    if (!formData.riskType) {
      validationErrors.push('Type of Risk is required');
    }
    if (!formData.project) {
      validationErrors.push('Project is required');
    }
    // Validate dollar impact if entered
    if (formData.dollarImpact && (isNaN(Number(formData.dollarImpact)) || Number(formData.dollarImpact) < 0)) {
      validationErrors.push('Dollar Impact must be a positive number');
    }
    if (formData.impactType === 'per_day' && (!formData.impactDays || isNaN(Number(formData.impactDays)) || Number(formData.impactDays) < 1)) {
      validationErrors.push('Number of days must be a positive integer');
    }
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    // Calculate metrics
    const probability = Number(formData.probability);
    const impact = Number(formData.impact);
    const mitigationEffectiveness = Number(formData.mitigationEffectiveness) / 100;
    const score = probability * impact;
    const residualScore = score * (1 - mitigationEffectiveness);
    // Financial impact
    let financialImpact = undefined;
    let residualImpact = undefined;
    let mitigationSavings = undefined;
    if (formData.dollarImpact) {
      const dollarImpact = Number(formData.dollarImpact);
      if (formData.impactType === 'per_day') {
        const days = Number(formData.impactDays) || 1;
        financialImpact = dollarImpact * days;
      } else {
        financialImpact = dollarImpact;
      }
      residualImpact = financialImpact * (1 - mitigationEffectiveness);
      mitigationSavings = financialImpact - residualImpact;
    }
    // Calculate risk levels
    const metrics = calculateRiskMetrics(probability, impact, mitigationEffectiveness);
    const now = new Date().toISOString();
    const riskData = {
      description: formData.description,
      probability,
      impact,
      score,
      riskLevel: metrics.riskLevel,
      mitigationEffectiveness,
      residualScore,
      residualRiskLevel: metrics.residualRiskLevel,
      owner: formData.owner,
      category: formData.category,
      project: formData.project,
      status: formData.status,
      notes: formData.notes,
      comments: formData.comments,
      createdAt: risk?.createdAt || now,
      updatedAt: now,
      causes: risk?.causes || [],
      effects: risk?.effects || [],
      rootCause: risk?.rootCause || false,
      dollarImpact: formData.dollarImpact ? Number(formData.dollarImpact) : undefined,
      impactType: formData.impactType,
      impactDays: formData.impactType === 'per_day' ? Number(formData.impactDays) : undefined,
      financialImpact,
      mitigationSavings,
      residualImpact,
      riskType: formData.riskType as 'root_cause' | 'intermediate' | 'effect',
      highPriority: formData.highPriority,
    };
    onSave(riskData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {risk ? 'Edit Risk' : 'Add New Risk'}
          </h2>

          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
              <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the risk..."
                required
              />
            </div>

            {/* Probability and Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probability (1-5) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.probability}
                  onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">1 = Very unlikely, 5 = Very likely</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact (1-5) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.impact}
                  onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">1 = Minimal impact, 5 = Severe impact</p>
              </div>
            </div>
            {/* Mitigation Effectiveness */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mitigation Effectiveness (0-100%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.mitigationEffectiveness}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mitigationEffectiveness: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0-100"
              />
              <p className="text-xs text-gray-500 mt-1">How effective are current mitigation measures?</p>
            </div>
            {/* Dollar Impact and Impact Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dollar Value (Impact, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dollarImpact}
                  onChange={(e) => setFormData(prev => ({ ...prev, dollarImpact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact Type
                </label>
                <select
                  value={formData.impactType}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactType: e.target.value as 'per_day' | 'lump_sum' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lump_sum">Lump Sum</option>
                  <option value="per_day">Per Day</option>
                </select>
              </div>
            </div>
            {/* Impact Days if per_day */}
            {formData.impactType === 'per_day' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Days (if per day)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.impactDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactDays: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10"
                />
              </div>
            )}
            {/* Project Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select or enter project name"
                required
              />
            </div>
            {/* Type of Risk Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Risk *
              </label>
              <select
                value={formData.riskType}
                onChange={(e) => setFormData(prev => ({ ...prev, riskType: e.target.value as 'root_cause' | 'intermediate' | 'effect' | '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="root_cause">Root Cause</option>
                <option value="intermediate">Intermediate</option>
                <option value="effect">Effect</option>
              </select>
            </div>
            {/* High Priority Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.highPriority}
                onChange={(e) => setFormData(prev => ({ ...prev, highPriority: e.target.checked }))}
                className="mr-2"
                id="highPriority"
              />
              <label htmlFor="highPriority" className="text-sm font-medium text-gray-700">
                Mark as High Priority (optional)
              </label>
            </div>

            {/* Owner and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Who is responsible for this risk?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cybersecurity, Operations, Financial"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as 'Open' | 'In Progress' | 'Mitigated' | 'Closed' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Additional notes about this risk..."
              />
            </div>

            {/* Comments/Lessons Learned */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments/Lessons Learned
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="What have we learned? What worked? What didn't?"
              />
            </div>

            {/* Calculated Preview */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Risk Calculation Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Risk Score:</span> {Number(formData.probability) * Number(formData.impact) || '-'}
                </div>
                <div>
                  <span className="font-medium">Residual Score:</span> {
                    isNaN(Number(formData.probability)) || isNaN(Number(formData.impact)) || isNaN(Number(formData.mitigationEffectiveness))
                      ? '-'
                      : ((Number(formData.probability) * Number(formData.impact)) * (1 - (Number(formData.mitigationEffectiveness) / 100))).toFixed(1)
                  }
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (risk ? 'Update Risk' : 'Add Risk')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}