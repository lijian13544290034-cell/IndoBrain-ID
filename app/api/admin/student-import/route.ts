import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/account/auth';
import { initialStudentPassword } from '@/lib/account/config';
import { MAX_IMPORT_ROWS, normalizeStudentImportRows, type StudentImportIssue } from '@/lib/account/bulk-import';
import { hashPassword, validatePassword } from '@/lib/account/password';
import { audit, completeStudentImportBatch, createStudentImportBatch, createUser, findUserByPhone } from '@/lib/account/repository';

export const runtime = 'nodejs';

type ImportBody = { action?: 'preflight' | 'execute'; rows?: unknown; sourceFileName?: string };

async function preflight(rows: unknown) {
  const parsed = normalizeStudentImportRows(rows);
  const issues: StudentImportIssue[] = [...parsed.issues];
  const ready = [] as typeof parsed.rows;
  for (const row of parsed.rows) {
    if (await findUserByPhone(row.phone)) {
      issues.push({ rowNumber: row.rowNumber, name: row.name, phone: row.phone, reason: '账号已存在，将跳过。', code: 'EXISTING_ACCOUNT' });
    } else ready.push(row);
  }
  return { ...parsed, rows: ready, issues };
}

export async function POST(request: Request) {
  try {
    const admin = await requireSuperAdmin();
    const body = (await request.json()) as ImportBody;
    if (!Array.isArray(body.rows)) return NextResponse.json({ error: 'Import rows are required.' }, { status: 400 });
    if (body.rows.length > MAX_IMPORT_ROWS) return NextResponse.json({ error: `A batch may contain at most ${MAX_IMPORT_ROWS} rows.` }, { status: 400 });
    const review = await preflight(body.rows);
    const summary = { totalRows: review.totalRows, validRows: review.rows.length, invalidRows: review.issues.filter((issue) => issue.code !== 'EXISTING_ACCOUNT').length, existingRows: review.issues.filter((issue) => issue.code === 'EXISTING_ACCOUNT').length, issues: review.issues };
    if (body.action !== 'execute') return NextResponse.json(summary);

    const password = initialStudentPassword();
    const passwordError = validatePassword(password);
    if (passwordError) return NextResponse.json({ error: 'The configured initial password does not meet the password policy.' }, { status: 503 });
    const batch = await createStudentImportBatch({ actorUserId: admin.id, sourceFileName: body.sourceFileName?.slice(0, 180) ?? null, totalRows: review.totalRows });
    let createdRows = 0;
    const failures = [...review.issues];
    for (const row of review.rows) {
      try {
        // Re-check immediately before mutation to handle a concurrent administrator import.
        if (await findUserByPhone(row.phone)) {
          failures.push({ rowNumber: row.rowNumber, name: row.name, phone: row.phone, reason: '账号已存在，将跳过。', code: 'EXISTING_ACCOUNT' });
          continue;
        }
        const user = await createUser({ phone: row.phone, passwordHash: await hashPassword(password), displayName: row.name, membership: row.membershipStatus, learningDirection: row.learningDirection, expiresAt: row.membershipExpiresAt, accountStatus: 'ACTIVE', registerSource: 'BULK_IMPORT', createdBy: admin.id, mustChangePassword: true, createdByBatchId: batch.id });
        await audit(admin.id, 'STUDENT_IMPORTED', user.id, { batch_id: batch.id, membership: row.membershipStatus, learning_direction: row.learningDirection });
        createdRows += 1;
      } catch {
        failures.push({ rowNumber: row.rowNumber, name: row.name, phone: row.phone, reason: '创建账号失败。', code: 'EXISTING_ACCOUNT' });
      }
    }
    const skippedRows = failures.filter((item) => item.code === 'EXISTING_ACCOUNT').length;
    const failedRows = failures.length - skippedRows;
    await completeStudentImportBatch(batch.id, { validRows: review.rows.length, createdRows, failedRows, skippedRows, failureRecords: failures });
    await audit(admin.id, 'STUDENT_IMPORT_COMPLETED', undefined, { batch_id: batch.id, created_rows: createdRows, failed_rows: failedRows, skipped_rows: skippedRows });
    return NextResponse.json({ batchId: batch.id, ...summary, createdRows, failedRows, skippedRows, issues: failures });
  } catch (error) {
    const message = error instanceof Error && error.message === 'INITIAL_STUDENT_PASSWORD_NOT_CONFIGURED'
      ? 'The server initial password is not configured.'
      : 'Unable to process the student import.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
