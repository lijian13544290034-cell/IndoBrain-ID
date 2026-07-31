import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireSuperAdmin } from '@/lib/account/auth';

export const runtime = 'nodejs';

const headers = ['name', 'phone', 'learningDirection', 'membershipStatus', 'membershipExpiresAt'];
const example = ['张三', '+628123456789', 'ZH_TO_ID', 'BASIC', ''];

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
    const format = new URL(request.url).searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';
    if (format === 'csv') {
      return new NextResponse(`${headers.join(',')}\n${example.join(',')}\n`, {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="indobrain-student-import-template.csv"' },
      });
    }
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([headers, example]);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Students');
    const bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(bytes, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="indobrain-student-import-template.xlsx"' } });
  } catch {
    return NextResponse.json({ error: 'Administrator permission is required.' }, { status: 403 });
  }
}
