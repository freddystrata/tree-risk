import * as XLSX from 'xlsx';
import { RiskItem, ProjectRiskSummary } from '@/types/risk';

/**
 * Export risks to Excel file
 */
export function exportRisksToExcel(risks: RiskItem[], filename: string = 'risks-export.xlsx'): void {
  // Prepare data for export
  const exportData = risks.map(risk => ({
    'Risk ID': risk.id,
    'Description': risk.description,
    'Project': risk.project || 'N/A',
    'Category': risk.category || 'N/A',
    'Owner': risk.owner || 'N/A',
    'Probability (1-5)': risk.probability,
    'Impact (1-5)': risk.impact,
    'Risk Score': risk.score,
    'Risk Level': risk.riskLevel,
    'Mitigation Effectiveness (%)': Math.round(risk.mitigationEffectiveness * 100),
    'Residual Score': risk.residualScore,
    'Residual Risk Level': risk.residualRiskLevel,
    'Status': risk.status,
    'Notes': risk.notes || '',
    'Comments/Lessons': risk.comments || '',
    'Created Date': new Date(risk.createdAt).toLocaleDateString(),
    'Updated Date': new Date(risk.updatedAt).toLocaleDateString(),
    'Mitigation Date': risk.mitigationDate ? new Date(risk.mitigationDate).toLocaleDateString() : '',
    'Root Cause': risk.rootCause ? 'Yes' : 'No'
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add main risks sheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Auto-size columns
  const colWidths = [
    { wch: 12 }, // Risk ID
    { wch: 50 }, // Description
    { wch: 25 }, // Project
    { wch: 15 }, // Category
    { wch: 20 }, // Owner
    { wch: 12 }, // Probability
    { wch: 12 }, // Impact
    { wch: 12 }, // Risk Score
    { wch: 15 }, // Risk Level
    { wch: 18 }, // Mitigation Effectiveness
    { wch: 12 }, // Residual Score
    { wch: 15 }, // Residual Risk Level
    { wch: 12 }, // Status
    { wch: 30 }, // Notes
    { wch: 30 }, // Comments
    { wch: 12 }, // Created Date
    { wch: 12 }, // Updated Date
    { wch: 12 }, // Mitigation Date
    { wch: 10 }  // Root Cause
  ];
  
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Register');
  
  // Add risk matrix reference sheet
  const matrixData = [
    { '': '', 'Impact 1': 'Impact 2', 'Impact 3': 'Impact 4', 'Impact 5': '' },
    { '': 'Probability 1', 'Impact 1': 1, 'Impact 2': 2, 'Impact 3': 3, 'Impact 4': 4, 'Impact 5': 5 },
    { '': 'Probability 2', 'Impact 1': 2, 'Impact 2': 4, 'Impact 3': 6, 'Impact 4': 8, 'Impact 5': 10 },
    { '': 'Probability 3', 'Impact 1': 3, 'Impact 2': 6, 'Impact 3': 9, 'Impact 4': 12, 'Impact 5': 15 },
    { '': 'Probability 4', 'Impact 1': 4, 'Impact 2': 8, 'Impact 3': 12, 'Impact 4': 16, 'Impact 5': 20 },
    { '': 'Probability 5', 'Impact 1': 5, 'Impact 2': 10, 'Impact 3': 15, 'Impact 4': 20, 'Impact 5': 25 },
    {},
    { '': 'Risk Level Categories:', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '1-2: ACCEPTABLE', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '3-4: VERY LOW', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '5-6: LOW', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '8-9: SIGNIFICANT', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '10-12: HIGH', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '15-16: VERY HIGH', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' },
    { '': '20-25: PROCEED AT YOUR OWN RISK', 'Impact 1': '', 'Impact 2': '', 'Impact 3': '', 'Impact 4': '', 'Impact 5': '' }
  ];
  
  const matrixWs = XLSX.utils.json_to_sheet(matrixData);
  XLSX.utils.book_append_sheet(wb, matrixWs, 'Risk Matrix');
  
  // Download file
  XLSX.writeFile(wb, filename);
}

/**
 * Export project summary to Excel
 */
export function exportProjectSummaryToExcel(
  projectSummaries: ProjectRiskSummary[], 
  filename: string = 'project-risk-summary.xlsx'
): void {
  const summaryData = projectSummaries.map(summary => ({
    'Project Name': summary.projectName,
    'Total Risks': summary.totalRisks,
    'High Risk Count': summary.highRisks,
    'Open Risks': summary.openRisks,
    'Mitigated Risks': summary.mitigatedRisks,
    'Average Risk Score': summary.averageScore,
    'Risk Trend': summary.riskTrend,
    'Profitability Impact': summary.expectedProfitabilityImpact
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summaryData);
  
  // Auto-size columns
  ws['!cols'] = [
    { wch: 25 }, // Project Name
    { wch: 12 }, // Total Risks
    { wch: 15 }, // High Risk Count
    { wch: 12 }, // Open Risks
    { wch: 15 }, // Mitigated Risks
    { wch: 18 }, // Average Risk Score
    { wch: 12 }, // Risk Trend
    { wch: 18 }  // Profitability Impact
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Project Summary');
  
  // Add timeline data for each project
  projectSummaries.forEach(summary => {
    if (summary.timeline.length > 0) {
      const timelineData = summary.timeline.map(entry => ({
        'Date': new Date(entry.date).toLocaleDateString(),
        'Risk ID': entry.riskId,
        'Event': entry.event,
        'Description': entry.description,
        'Risk Level': entry.riskLevel
      }));
      
      const timelineWs = XLSX.utils.json_to_sheet(timelineData);
      timelineWs['!cols'] = [
        { wch: 12 }, // Date
        { wch: 12 }, // Risk ID
        { wch: 12 }, // Event
        { wch: 40 }, // Description
        { wch: 15 }  // Risk Level
      ];
      
      XLSX.utils.book_append_sheet(wb, timelineWs, `${summary.projectName} Timeline`);
    }
  });
  
  XLSX.writeFile(wb, filename);
}

/**
 * Export cause-effect relationships to Excel
 */
export function exportCauseEffectToExcel(risks: RiskItem[], filename: string = 'cause-effect-analysis.xlsx'): void {
  // Extract cause-effect relationships
  const relationships = risks.filter(risk => risk.causes && risk.causes.length > 0).map(risk => {
    const causes = risk.causes || [];
    const effects = risk.effects || [];
    
    return {
      'Risk ID': risk.id,
      'Description': risk.description,
      'Project': risk.project || 'N/A',
      'Is Root Cause': risk.rootCause ? 'Yes' : 'No',
      'Causes (Risk IDs)': causes.join(', '),
      'Effects (Risk IDs)': effects.join(', '),
      'Risk Score': risk.score,
      'Risk Level': risk.riskLevel,
      'Status': risk.status
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(relationships);
  
  ws['!cols'] = [
    { wch: 12 }, // Risk ID
    { wch: 40 }, // Description
    { wch: 25 }, // Project
    { wch: 12 }, // Is Root Cause
    { wch: 20 }, // Causes
    { wch: 20 }, // Effects
    { wch: 12 }, // Risk Score
    { wch: 15 }, // Risk Level
    { wch: 12 }  // Status
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Cause-Effect Analysis');
  
  // Add root causes analysis
  const rootCauses = risks.filter(risk => risk.rootCause).map(risk => ({
    'Root Cause Risk ID': risk.id,
    'Description': risk.description,
    'Project': risk.project || 'N/A',
    'Direct Effects Count': risk.effects?.length || 0,
    'Risk Score': risk.score,
    'Mitigation Status': risk.status
  }));
  
  if (rootCauses.length > 0) {
    const rootCauseWs = XLSX.utils.json_to_sheet(rootCauses);
    rootCauseWs['!cols'] = [
      { wch: 15 }, // Root Cause Risk ID
      { wch: 40 }, // Description
      { wch: 25 }, // Project
      { wch: 18 }, // Direct Effects Count
      { wch: 12 }, // Risk Score
      { wch: 15 }  // Mitigation Status
    ];
    
    XLSX.utils.book_append_sheet(wb, rootCauseWs, 'Root Causes');
  }
  
  XLSX.writeFile(wb, filename);
}