import * as XLSX from 'xlsx';
import { RiskItem, ImportResult } from '@/types/risk';
import { createRiskItem } from './riskCalculations';

interface ExcelRiskRow {
  name?: string;
  description?: string;
  probability?: number;
  impact?: number;
  owner?: string;
  status?: string;
  notes?: string;
  comments?: string;
  category?: string;
  mitigationEffectiveness?: number;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function normalizeStatus(status: string): 'Open' | 'In Progress' | 'Mitigated' | 'Closed' {
  const statusLower = status.toLowerCase().trim();
  
  if (statusLower.includes('open')) return 'Open';
  if (statusLower.includes('progress') || statusLower.includes('active')) return 'In Progress';
  if (statusLower.includes('mitigated') || statusLower.includes('controlled')) return 'Mitigated';
  if (statusLower.includes('closed') || statusLower.includes('resolved')) return 'Closed';
  
  return 'Open'; // Default
}

function validateExcelRow(row: ExcelRiskRow, rowIndex: number): string[] {
  const errors: string[] = [];
  
  // Check required fields
  if (!row.name && !row.description) {
    errors.push(`Row ${rowIndex + 1}: Missing risk name/description`);
  }
  
  if (row.probability === undefined || row.probability === null || isNaN(row.probability)) {
    errors.push(`Row ${rowIndex + 1}: Missing or invalid probability`);
  } else if (row.probability < 1 || row.probability > 9) {
    errors.push(`Row ${rowIndex + 1}: Probability must be between 1 and 9`);
  }
  
  if (row.impact === undefined || row.impact === null || isNaN(row.impact)) {
    errors.push(`Row ${rowIndex + 1}: Missing or invalid impact`);
  } else if (row.impact < 1 || row.impact > 9) {
    errors.push(`Row ${rowIndex + 1}: Impact must be between 1 and 9`);
  }
  
  if (row.mitigationEffectiveness !== undefined && 
      (row.mitigationEffectiveness < 0 || row.mitigationEffectiveness > 1)) {
    errors.push(`Row ${rowIndex + 1}: Mitigation effectiveness must be between 0 and 1`);
  }
  
  return errors;
}

export function parseExcelFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        }) as string[][];
        
        if (jsonData.length < 2) {
          resolve({
            success: false,
            risks: [],
            errors: ['Excel file must have at least a header row and one data row']
          });
          return;
        }
        
        const headers = jsonData[0].map(h => h.toLowerCase().trim());
        const dataRows = jsonData.slice(1);
        
        // Map column indices
        const columnMap = {
          name: headers.findIndex(h => h.includes('name') || h.includes('description') || h.includes('risk')),
          probability: headers.findIndex(h => h.includes('probability') || h.includes('likelihood')),
          impact: headers.findIndex(h => h.includes('impact') || h.includes('severity')),
          owner: headers.findIndex(h => h.includes('owner') || h.includes('responsible')),
          status: headers.findIndex(h => h.includes('status')),
          notes: headers.findIndex(h => h.includes('notes')),
          comments: headers.findIndex(h => h.includes('comment') || h.includes('lesson')),
          category: headers.findIndex(h => h.includes('category') || h.includes('type')),
          mitigation: headers.findIndex(h => h.includes('mitigation') || h.includes('effectiveness'))
        };
        
        const errors: string[] = [];
        const risks: RiskItem[] = [];
        
        // Validate required columns exist
        if (columnMap.name === -1) {
          errors.push('Missing required column: name/description/risk');
        }
        if (columnMap.probability === -1) {
          errors.push('Missing required column: probability/likelihood');
        }
        if (columnMap.impact === -1) {
          errors.push('Missing required column: impact/severity');
        }
        
        if (errors.length > 0) {
          resolve({
            success: false,
            risks: [],
            errors
          });
          return;
        }
        
        // Process data rows
        dataRows.forEach((row, index) => {
          const excelRow: ExcelRiskRow = {
            name: row[columnMap.name]?.toString().trim() || '',
            probability: parseFloat(row[columnMap.probability]) || undefined,
            impact: parseFloat(row[columnMap.impact]) || undefined,
            owner: columnMap.owner !== -1 ? row[columnMap.owner]?.toString().trim() : '',
            status: columnMap.status !== -1 ? row[columnMap.status]?.toString().trim() : 'Open',
            notes: columnMap.notes !== -1 ? row[columnMap.notes]?.toString().trim() : '',
            comments: columnMap.comments !== -1 ? row[columnMap.comments]?.toString().trim() : '',
            category: columnMap.category !== -1 ? row[columnMap.category]?.toString().trim() : '',
            mitigationEffectiveness: columnMap.mitigation !== -1 ? 
              parseFloat(row[columnMap.mitigation]) || 0 : 0
          };
          
          // Skip empty rows
          if (!excelRow.name && !excelRow.probability && !excelRow.impact) {
            return;
          }
          
          const rowErrors = validateExcelRow(excelRow, index);
          errors.push(...rowErrors);
          
          // If no errors for this row, create risk item
          if (rowErrors.length === 0 && excelRow.name && excelRow.probability && excelRow.impact) {
            try {
              const riskData = createRiskItem({
                description: excelRow.name,
                probability: excelRow.probability,
                impact: excelRow.impact,
                mitigationEffectiveness: excelRow.mitigationEffectiveness || 0,
                owner: excelRow.owner,
                category: excelRow.category,
                status: normalizeStatus(excelRow.status || 'Open'),
                notes: excelRow.notes
              });
              
              const risk: RiskItem = {
                id: generateId(),
                ...riskData,
                comments: excelRow.comments
              };
              
              risks.push(risk);
            } catch (error) {
              errors.push(`Row ${index + 1}: Error creating risk - ${error}`);
            }
          }
        });
        
        resolve({
          success: errors.length === 0,
          risks,
          errors
        });
        
      } catch (error) {
        resolve({
          success: false,
          risks: [],
          errors: [`Error parsing Excel file: ${error}`]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        risks: [],
        errors: ['Error reading file']
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function createExcelTemplate(): void {
  const templateData = [
    ['Name/Description', 'Probability', 'Impact', 'Owner', 'Status', 'Category', 'Notes', 'Comments/Lessons'],
    ['Sample cyber security risk', 5, 7, 'IT Security Team', 'Open', 'Cybersecurity', 'Needs immediate attention', 'Previous incidents suggest this is critical'],
    ['Supply chain disruption', 3, 8, 'Operations Manager', 'In Progress', 'Operations', 'Monitoring suppliers', 'COVID highlighted our dependency'],
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Risk Template');
  
  // Download the file
  XLSX.writeFile(workbook, 'risk_template.xlsx');
}