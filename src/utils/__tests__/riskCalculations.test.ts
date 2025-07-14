import {
  calculateRiskScore,
  getRiskLevel,
  calculateResidualScore,
  calculateRiskMetrics,
  validateRiskValues,
  validateMitigationEffectiveness,
  RISK_LEVELS
} from '../riskCalculations';

describe('Risk Calculations', () => {
  describe('calculateRiskScore', () => {
    test('should calculate risk score correctly', () => {
      expect(calculateRiskScore(3, 4)).toBe(12);
      expect(calculateRiskScore(9, 9)).toBe(81);
      expect(calculateRiskScore(1, 1)).toBe(1);
    });
  });

  describe('getRiskLevel', () => {
    test('should return correct risk level for scores', () => {
      expect(getRiskLevel(1).name).toBe('LOWEST');
      expect(getRiskLevel(2).name).toBe('VERY LOW');
      expect(getRiskLevel(3).name).toBe('LOW');
      expect(getRiskLevel(4).name).toBe('MEDIUM LOW');
      expect(getRiskLevel(6).name).toBe('MEDIUM HIGH');
      expect(getRiskLevel(9).name).toBe('HIGHEST');
      expect(getRiskLevel(81).name).toBe('HIGHEST'); // Max score
    });

    test('should return LOWEST for scores below minimum threshold', () => {
      expect(getRiskLevel(0.5).name).toBe('LOWEST');
    });
  });

  describe('calculateResidualScore', () => {
    test('should calculate residual score correctly', () => {
      expect(calculateResidualScore(10, 0.5)).toBe(5); // 50% mitigation
      expect(calculateResidualScore(20, 0.2)).toBe(16); // 20% mitigation
      expect(calculateResidualScore(15, 0)).toBe(15); // No mitigation
      expect(calculateResidualScore(15, 1)).toBe(0); // Complete mitigation
    });
  });

  describe('calculateRiskMetrics', () => {
    test('should calculate all metrics correctly', () => {
      const result = calculateRiskMetrics(6, 8, 0.3);
      
      expect(result.score).toBe(48);
      expect(result.riskLevel).toBe('HIGHEST');
      expect(result.residualScore).toBeCloseTo(33.6); // 48 * (1 - 0.3)
      expect(result.residualRiskLevel).toBe('HIGHEST');
    });

    test('should handle zero mitigation', () => {
      const result = calculateRiskMetrics(3, 4, 0);
      
      expect(result.score).toBe(12);
      expect(result.residualScore).toBe(12);
      expect(result.riskLevel).toBe(result.residualRiskLevel);
    });
  });

  describe('validateRiskValues', () => {
    test('should return no errors for valid values', () => {
      expect(validateRiskValues(5, 7)).toEqual([]);
      expect(validateRiskValues(1, 9)).toEqual([]);
      expect(validateRiskValues(9, 1)).toEqual([]);
    });

    test('should return errors for invalid values', () => {
      expect(validateRiskValues(0, 5)).toContain('Probability must be between 1 and 9');
      expect(validateRiskValues(10, 5)).toContain('Probability must be between 1 and 9');
      expect(validateRiskValues(5, 0)).toContain('Impact must be between 1 and 9');
      expect(validateRiskValues(5, 10)).toContain('Impact must be between 1 and 9');
    });
  });

  describe('validateMitigationEffectiveness', () => {
    test('should return no errors for valid values', () => {
      expect(validateMitigationEffectiveness(0)).toEqual([]);
      expect(validateMitigationEffectiveness(0.5)).toEqual([]);
      expect(validateMitigationEffectiveness(1)).toEqual([]);
    });

    test('should return errors for invalid values', () => {
      expect(validateMitigationEffectiveness(-0.1)).toContain('Mitigation effectiveness must be between 0 and 1 (0% to 100%)');
      expect(validateMitigationEffectiveness(1.1)).toContain('Mitigation effectiveness must be between 0 and 1 (0% to 100%)');
    });
  });

  describe('RISK_LEVELS configuration', () => {
    test('should have proper threshold coverage', () => {
      expect(RISK_LEVELS).toHaveLength(6);
      const thresholds = RISK_LEVELS.map(l => l.threshold);
      expect(thresholds).toContain(1);  // Lowest threshold
      expect(thresholds).toContain(9);  // Highest threshold
    });

    test('should have all required properties', () => {
      RISK_LEVELS.forEach(level => {
        expect(level).toHaveProperty('threshold');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('color');
        expect(typeof level.threshold).toBe('number');
        expect(typeof level.name).toBe('string');
        expect(typeof level.color).toBe('string');
      });
    });
  });
});