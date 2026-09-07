import { describe, it, expect } from 'vitest';
import { encodeCsv } from '../src/lib/intelligence/csv';

describe('encodeCsv', () => {
  it('prepends UTF-8 BOM to output', () => {
    const csv = encodeCsv(['Col1'], [['Val1']]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('escapes quotes and wraps values in double quotes', () => {
    const headers = ['Name', 'Description'];
    const rows = [
      ['Dr. "Budi"', 'Pemeriksaan rutin'],
      ['Klinik "Senyum Sehat"', 'Scaling "pro" level'],
    ];

    const csv = encodeCsv(headers, rows);
    expect(csv).toBe(
      '\uFEFF"Name","Description"\r\n"Dr. ""Budi""","Pemeriksaan rutin"\r\n"Klinik ""Senyum Sehat""","Scaling ""pro"" level"'
    );
  });

  it('neutralizes formula injection characters (=, +, -, @)', () => {
    const headers = ['Command', 'Safe'];
    const rows = [
      ['=SUM(A1:A10)', 'Normal'],
      ['+12345', 'Normal'],
      ['-25000', 'Normal'],
      ['@SUM(B1:B5)', 'Normal'],
    ];

    const csv = encodeCsv(headers, rows);
    // Value becomes '\t prefix wrapped in quotes: e.g. "'\t=SUM(A1:A10)"
    expect(csv).toContain('\'\t=SUM(A1:A10)');
    expect(csv).toContain('\'\t+12345');
    expect(csv).toContain('\'\t-25000');
    expect(csv).toContain('\'\t@SUM(B1:B5)');
    // Verify raw formula without tab prefix does not appear in cells
    expect(csv).not.toContain('="SUM(A1:A10)"');
  });

  it('handles null, undefined, and numbers correctly', () => {
    const headers = ['Number', 'NullVal', 'UndefVal'];
    const rows = [[12345, null, undefined]];

    const csv = encodeCsv(headers, rows);
    expect(csv).toBe('\uFEFF"Number","NullVal","UndefVal"\r\n"12345","",""');
  });

  it('formats rows using CRLF line breaks', () => {
    const headers = ['A', 'B'];
    const rows = [
      ['1', '2'],
      ['3', '4'],
    ];

    const csv = encodeCsv(headers, rows);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('"A","B"');
    expect(lines[1]).toBe('"1","2"');
    expect(lines[2]).toBe('"3","4"');
  });
});