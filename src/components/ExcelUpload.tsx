'use client';

import { useState, useRef } from 'react';
import { RiskItem, ImportResult } from '@/types/risk';
import { parseExcelFile, createExcelTemplate } from '@/utils/excelImport';

interface ExcelUploadProps {
  onImport: (risks: RiskItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExcelUpload({ onImport, isOpen, onClose }: ExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setImportResult({
        success: false,
        risks: [],
        errors: ['Please upload an Excel file (.xlsx or .xls)']
      });
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const result = await parseExcelFile(file);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        risks: [],
        errors: [`Error processing file: ${error}`]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = () => {
    if (importResult?.risks) {
      onImport(importResult.risks);
      handleClose();
    }
  };

  const handleClose = () => {
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    createExcelTemplate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Risks from Excel</h2>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Excel file must contain columns: Name/Description, Probability, Impact</li>
              <li>Optional columns: Owner, Status, Category, Notes, Comments/Lessons</li>
              <li>Probability and Impact must be numbers between 1-9</li>
              <li>Download the template below for the correct format</li>
            </ul>
          </div>

          {/* Download Template Button */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              📥 Download Excel Template
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            />
          </div>

          {/* Upload Status */}
          {isUploading && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-yellow-800">Processing file...</span>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="mb-6">
              {importResult.success ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    ✅ Import Successful!
                  </h3>
                  <p className="text-sm text-green-700">
                    Found {importResult.risks.length} valid risk(s) ready to import.
                  </p>
                  
                  {/* Preview of imported risks */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Preview:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {importResult.risks.slice(0, 5).map((risk, index) => (
                        <div key={index} className="text-xs text-green-700 py-1 border-b border-green-200">
                          <strong>{risk.description}</strong> - Score: {risk.score} ({risk.riskLevel})
                        </div>
                      ))}
                      {importResult.risks.length > 5 && (
                        <div className="text-xs text-green-600 py-1">
                          ... and {importResult.risks.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    ❌ Import Failed
                  </h3>
                  <div className="text-sm text-red-700">
                    <p className="mb-2">Please fix the following issues:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            {importResult?.success && (
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Import {importResult.risks.length} Risk(s)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}