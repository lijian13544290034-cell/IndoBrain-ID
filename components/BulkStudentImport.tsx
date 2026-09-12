'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

type ImportRow = { name?: unknown; phone?: unknown; learningDirection?: unknown; membershipStatus?: unknown; membershipExpiresAt?: unknown };
type Issue = { rowNumber: number; name?: string; phone?: string; reason: string; code: string };
type Result = { totalRows: number; validRows: number; invalidRows: number; existingRows: number; createdRows?: number; failedRows?: number; skippedRows?: number; issues: Issue[]; batchId?: string };
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 500;
function normalizeHeader(value: unknown) { return String(value ?? '').trim(); }
function failureCsv(issues: Issue[]) {
  const cell = (value: unknown) => `"${String(value ?? '').replace(/^([=+\-@])/, "'$1").replaceAll('"', '""')}"`;
  return ['rowNumber,name,phone,reason', ...issues.map((item) => [item.rowNumber, item.name, item.phone, item.reason].map(cell).join(','))].join('\n');
}

export default function BulkStudentImport() {
  const [fileName, setFileName] = useState(''); const [rows, setRows] = useState<ImportRow[]>([]); const [result, setResult] = useState<Result | null>(null); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  const canExecute = Boolean(result && result.validRows > 0 && !loading); const hasFailures = Boolean(result?.issues.length);
  async function preview(sourceRows: ImportRow[], sourceFileName: string) {
    setLoading(true); setMessage(''); setResult(null);
    const response = await fetch('/api/admin/student-import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'preflight', rows: sourceRows, sourceFileName }) });
    const data = await response.json() as Result & { error?: string }; setLoading(false);
    if (!response.ok) return setMessage(data.error ?? '无法预检导入文件。'); setRows(sourceRows); setResult(data);
  }
  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setFileName(file.name); setMessage(''); setResult(null);
    if (file.size > MAX_FILE_BYTES) return setMessage('文件不能超过 2 MB。'); if (!/\.(csv|xlsx)$/i.test(file.name)) return setMessage('只支持 CSV 或 XLSX 文件。');
    try {
      const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array', raw: false }); const firstSheet = workbook.Sheets[workbook.SheetNames[0]]; const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '' }); const headers = (matrix[0] ?? []).map(normalizeHeader); const expected = ['name', 'phone', 'learningDirection', 'membershipStatus', 'membershipExpiresAt'];
      if (expected.some((header) => !headers.includes(header))) return setMessage('模板必须包含 name、phone、learningDirection、membershipStatus、membershipExpiresAt。');
      const parsed = matrix.slice(1).filter((row) => row.some((value) => String(value ?? '').trim())).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
      if (!parsed.length) return setMessage('文件中没有可导入的数据。'); if (parsed.length > MAX_ROWS) return setMessage(`单次最多导入 ${MAX_ROWS} 条。`); await preview(parsed, file.name);
    } catch { setMessage('无法读取文件，请使用提供的 CSV 或 XLSX 模板。'); }
  }
  async function execute() {
    if (!canExecute || !confirm(`确认创建 ${result?.validRows ?? 0} 个新学员账号？本批次将使用服务器配置的统一初始密码。`)) return; setLoading(true); setMessage('');
    const response = await fetch('/api/admin/student-import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'execute', rows, sourceFileName: fileName }) }); const data = await response.json() as Result & { error?: string }; setLoading(false);
    if (!response.ok) return setMessage(data.error ?? '无法创建学员账号。'); setResult(data); setMessage(`导入完成：成功 ${data.createdRows ?? 0} 个，跳过 ${data.skippedRows ?? 0} 个，失败 ${data.failedRows ?? 0} 个。`);
  }
  const summary = useMemo(() => result ? [['总行数', result.totalRows], ['可创建', result.validRows], ['无效', result.invalidRows], ['已存在', result.existingRows]] : [], [result]);
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-semibold">Impor Siswa Massal <span className="text-gray-400">（批量导入学员）</span></h2><p className="mt-1 text-sm text-gray-500">仅 SUPER_ADMIN 可用。导入完成的账号必须在首次登录后修改密码。</p></div><div className="flex gap-2"><a href="/api/admin/student-import/template?format=csv" className="rounded-xl border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50">CSV 模板</a><a href="/api/admin/student-import/template?format=xlsx" className="rounded-xl border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50">XLSX 模板</a></div></div><div className="mt-5 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4"><label className="block cursor-pointer text-sm font-medium text-gray-800">选择 CSV 或 XLSX 文件（最多 500 行 / 2 MB）<input className="mt-3 block w-full text-sm" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFile} disabled={loading} /></label><p className="mt-2 text-xs text-gray-500">字段：name、phone、learningDirection、membershipStatus、membershipExpiresAt。手机号必须使用国际格式。</p><p className="mt-1 text-xs text-gray-500">本批次将使用统一初始密码；密码仅由服务器读取，不会显示或写入日志。</p>{fileName && <p className="mt-2 text-sm text-gray-600">已选择：{fileName}</p>}</div>{message && <p role="status" className="mt-4 rounded-xl bg-stone-100 px-3 py-2 text-sm text-gray-700">{message}</p>}{result && <><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{summary.map(([label, value]) => <div key={String(label)} className="rounded-xl bg-stone-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button disabled={!canExecute} onClick={execute} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? '正在处理…' : `确认创建 ${result.validRows} 个账号`}</button>{hasFailures && <button onClick={() => { const blob = new Blob([failureCsv(result.issues)], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'indobrain-student-import-failures.csv'; link.click(); URL.revokeObjectURL(url); }} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm hover:bg-stone-50">下载失败记录 CSV</button>}</div>{hasFailures && <div className="mt-5 max-h-60 overflow-auto rounded-xl border border-stone-200"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-stone-50 text-xs text-gray-500"><tr><th className="p-3">行</th><th>姓名</th><th>手机号</th><th className="p-3">原因</th></tr></thead><tbody>{result.issues.map((issue, index) => <tr key={`${issue.rowNumber}-${index}`} className="border-t border-stone-100"><td className="p-3">{issue.rowNumber}</td><td>{issue.name ?? '—'}</td><td>{issue.phone ?? '—'}</td><td className="p-3">{issue.reason}</td></tr>)}</tbody></table></div>}</>}</section>;
}
