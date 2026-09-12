import { LEARNING_DIRECTIONS, MEMBERSHIP_LEVELS, type LearningDirection, type MembershipLevel } from './types';
import { normalizePhone } from './repository';

export const MAX_IMPORT_ROWS = 500;

export type StudentImportRow = {
  rowNumber: number;
  name: string;
  phone: string;
  learningDirection: LearningDirection;
  membershipStatus: MembershipLevel;
  membershipExpiresAt: string | null;
};

export type StudentImportIssue = {
  rowNumber: number;
  name?: string;
  phone?: string;
  reason: string;
  code: 'MISSING_NAME' | 'INVALID_PHONE' | 'INVALID_DIRECTION' | 'INVALID_MEMBERSHIP' | 'INVALID_EXPIRY' | 'UNSAFE_VALUE' | 'DUPLICATE_PHONE' | 'EXISTING_ACCOUNT';
};

type RawRow = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function unsafe(value: string) {
  return /^[=+\-@]/.test(value);
}

function parseExpiry(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Validate untrusted sheet rows before any account mutation. */
export function normalizeStudentImportRows(rows: unknown): { rows: StudentImportRow[]; issues: StudentImportIssue[]; totalRows: number } {
  const source = Array.isArray(rows) ? rows.slice(0, MAX_IMPORT_ROWS) : [];
  const issues: StudentImportIssue[] = [];
  const normalized: StudentImportRow[] = [];
  const phones = new Set<string>();

  source.forEach((candidate, index) => {
    const rowNumber = index + 2;
    const row = (candidate && typeof candidate === 'object' ? candidate : {}) as RawRow;
    const name = text(row.name);
    const phoneRaw = text(row.phone);
    const direction = text(row.learningDirection).toUpperCase();
    const membership = (text(row.membershipStatus) || 'BASIC').toUpperCase();
    const expiryRaw = text(row.membershipExpiresAt);
    if (!name) return issues.push({ rowNumber, phone: phoneRaw, reason: '缺少姓名。', code: 'MISSING_NAME' });
    if ([name, phoneRaw, direction, membership, expiryRaw].some(unsafe)) return issues.push({ rowNumber, name, phone: phoneRaw, reason: '字段不能以公式字符开头。', code: 'UNSAFE_VALUE' });
    let phone: string;
    try { phone = normalizePhone(phoneRaw); } catch { return issues.push({ rowNumber, name, phone: phoneRaw, reason: '手机号必须是国际格式，例如 +628123456789。', code: 'INVALID_PHONE' }); }
    if (!LEARNING_DIRECTIONS.includes(direction as LearningDirection)) return issues.push({ rowNumber, name, phone, reason: 'learningDirection 必须是 ZH_TO_ID 或 ID_TO_ZH。', code: 'INVALID_DIRECTION' });
    if (!MEMBERSHIP_LEVELS.includes(membership as MembershipLevel)) return issues.push({ rowNumber, name, phone, reason: 'membershipStatus 无效。', code: 'INVALID_MEMBERSHIP' });
    const expiry = parseExpiry(expiryRaw);
    if (expiry === undefined) return issues.push({ rowNumber, name, phone, reason: '到期日期格式无效。', code: 'INVALID_EXPIRY' });
    if (phones.has(phone)) return issues.push({ rowNumber, name, phone, reason: '文件内手机号重复。', code: 'DUPLICATE_PHONE' });
    phones.add(phone);
    normalized.push({ rowNumber, name, phone, learningDirection: direction as LearningDirection, membershipStatus: membership as MembershipLevel, membershipExpiresAt: expiry });
  });

  if (Array.isArray(rows) && rows.length > MAX_IMPORT_ROWS) {
    issues.push({ rowNumber: MAX_IMPORT_ROWS + 2, reason: `单次最多导入 ${MAX_IMPORT_ROWS} 条。`, code: 'INVALID_PHONE' });
  }
  return { rows: normalized, issues, totalRows: Array.isArray(rows) ? rows.length : 0 };
}

/** Escape values before producing a CSV that may be opened in a spreadsheet. */
export function csvCell(value: unknown) {
  const raw = String(value ?? '');
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}
