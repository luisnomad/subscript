import { describe, expect, it } from 'vitest';
import { generateMockPendingImport, generateMultipleMockImports } from './mockDataGenerator';

describe('mockDataGenerator', () => {
  it('generates a mock pending import', () => {
    const mockImport = generateMockPendingImport();
    expect(mockImport).toHaveProperty('emailSubject');
    expect(mockImport).toHaveProperty('emailFrom');
    expect(mockImport).toHaveProperty('emailDate');
    expect(mockImport).toHaveProperty('classification');
    expect(mockImport).toHaveProperty('extractedData');
    expect(mockImport).toHaveProperty('confidence');
  });

  it('generates multiple mock pending imports', () => {
    const count = 5;
    const imports = generateMultipleMockImports(count);
    expect(imports).toHaveLength(count);
    for (const mockImport of imports) {
      expect(['subscription', 'domain']).toContain(mockImport.classification);
      expect(mockImport.confidence).toBeGreaterThanOrEqual(0);
      expect(mockImport.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('generates both subscriptions and domains over multiple calls', () => {
    const imports = generateMultipleMockImports(50);
    const hasSubscription = imports.some(i => i.classification === 'subscription');
    const hasDomain = imports.some(i => i.classification === 'domain');
    
    expect(hasSubscription).toBe(true);
    expect(hasDomain).toBe(true);
  });
});
