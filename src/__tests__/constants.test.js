import { describe, it, expect } from 'vitest';
import { VERSION, CDN_BASE } from '../constants.js';

describe('Constants', () => {
  it('should have valid version format', () => {
    expect(VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
  });

  it('should have valid CDN URL', () => {
    expect(CDN_BASE).toMatch(/^https:\/\/cdn\.jsdelivr\.net/);
  });

  it('should have version in CDN URL', () => {
    expect(CDN_BASE).toContain(VERSION);
  });

  it('should have correct repository path in CDN', () => {
    expect(CDN_BASE).toContain('Fahell/test-perchance-git');
  });
});
