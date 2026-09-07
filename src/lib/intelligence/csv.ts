/**
 * Pure CSV encoding utilities for export.
 * Neutralizes formula injection vulnerabilities and prepends UTF-8 BOM.
 */

const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@'];

/**
 * Encodes headers and rows into RFC 4180 compliant CSV string with UTF-8 BOM.
 * Neutralizes formula injection by prefixing cell values starting with =, +, -, @ with a tab character ('\t').
 * Wraps every cell in double quotes, escaping existing double quotes as "".
 */
export function encodeCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const sanitizeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) {
      return '""';
    }

    const str = String(val);

    // Neutralize formula injection: prefix with '\t if starts with =, +, -, or @
    const isFormula = FORMULA_INJECTION_PREFIXES.some((prefix) => str.startsWith(prefix));
    const safeStr = isFormula ? `'\t${str}` : str;

    // Escape double quotes by doubling them
    const escaped = safeStr.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const headerLine = headers.map(sanitizeCell).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCell).join(','));

  const lines = [headerLine, ...rowLines];
  // RFC 4180 standard row delimiter is CRLF (\r\n)
  const csvBody = lines.join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  return `\uFEFF${csvBody}`;
}
