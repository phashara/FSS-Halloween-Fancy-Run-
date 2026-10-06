/** Encode untrusted text as one CSV cell, including spreadsheet formula protection. */
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s\uFEFF]*[=+\-@＝＋－＠]/u.test(text) || /^[\t\r\n]/.test(text)) {
    text = "'" + text;
  }
  return '"' + text.replace(/"/g, '""') + '"';
}

export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(',');
}
