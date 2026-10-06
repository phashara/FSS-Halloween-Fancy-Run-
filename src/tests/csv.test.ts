import { describe, expect, it } from 'vitest';
import { csvCell, csvRow } from '../lib/csv';

describe('safe CSV exports', () => {
  it.each(['=1+1', '+1+1', '-1+1', '@SUM(A1)', '  =1+1', '\t=1+1', '\r=1+1', '\n=1+1', '＝1+1'])('neutralizes formula-like input %j', (input) => {
    expect(csvCell(input)).toBe('"\'' + input + '"');
  });
  it('quotes separators, embedded quotes and multiline content', () => {
    expect(csvRow(['ชื่อ, นามสกุล', 'ชื่อ "เล่น"', 'บรรทัดแรก\nบรรทัดสอง'])).toBe('"ชื่อ, นามสกุล","ชื่อ ""เล่น""","บรรทัดแรก\nบรรทัดสอง"');
  });
  it('preserves normal names and leading-zero phone numbers', () => {
    expect(csvRow(['ทดสอบ ระบบ', '0123456789', 250, null])).toBe('"ทดสอบ ระบบ","0123456789","250",""');
  });
});
