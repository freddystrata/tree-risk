'use client';

import { useState, useEffect } from 'react';
import { RiskItem } from '@/types/risk';
import { calculateRiskMetrics, validateRiskValues, validateMitigationEffectiveness } from '@/utils/riskCalculations';

interface RiskFormProps {
  risk?: RiskItem | null; // null for new risk, RiskItem for editing
  onSave: (risk: Omit<RiskItem, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function RiskForm({ risk, onSave, onCancel, isOpen }: RiskFormProps) {
  const [formData, setFormData] = useState<{
    description: string;
    probability: number;
    impact: number;
    mitigationEffectiveness: number;
    owner: string;
    category: string;
    status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
    notes: string;
    comments: string;
  }>({
    description: '',
    probability: 1,
    impact: 1,
    mitigationEffectiveness: 0,
    owner: '',
    category: '',
    status: 'In Progress',
    notes: '',
    comments: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when risk prop changes
  useEffect(() => {
    if (risk) {
      setFormData({
        description: risk.description,
        probability: risk.probability,
        impact: risk.impact,
        mitigationEffectiveness: risk.mitigationEffectiveness,
        owner: risk.owner || '',
        category: risk.category || '',
        status: risk.status,
        notes: risk.notes || '',
        comments: risk.comments || '',
      });
    } else {
      // Reset for new risk
      setFormData({
        description: '',
        probability: 1,
        impact: 1,
        mitigationEffectiveness: 0,
        owner: '',
        category: '',
        status: 'In Progress',
        notes: '',
        comments: '',
      });
    }
    setErrors([]);
  }, [risk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate input
    const validationErrors: string[] = [];
    
    if (!formData.description.trim()) {
      validationErrors.push('Description is required');
    }

    const riskErrors = validateRiskValues(formData.probability, formData.impact);
    const mitigationErrors = validateMitigationEffectiveness(formData.mitigationEffectiveness);
    
    validationErrors.push(...riskErrors, ...mitigationErrors);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Calculate metrics
    const metrics = calculateRiskMetrics(
      formData.probability,
      formData.impact,
      formData.mitigationEffectiveness
    );

    const now = new Date().toISOString();
    const riskData = {
      ...formData,
      ...metrics,
      createdAt: risk?.createdAt || now,
      updatedAt: now,
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
                  Probability (1-9) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={formData.probability}
                  onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">1 = Very unlikely, 9 = Very likely</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact (1-9) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={formData.impact}
                  onChange={(e) => setFormData(prev => ({ ...prev, impact: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">1 = Minimal impact, 9 = Severe impact</p>
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
                value={Math.round(formData.mitigationEffectiveness * 100)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  mitigationEffectiveness: (parseInt(e.target.value) || 0) / 100 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">How effective are current mitigation measures?</p>
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
                  <span className="font-medium">Risk Score:</span> {formData.probability * formData.impact}
                </div>
                <div>
                  <span className="font-medium">Residual Score:</span> {
                    ((formData.probability * formData.impact) * (1 - formData.mitigationEffectiveness)).toFixed(1)
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