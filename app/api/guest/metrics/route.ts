import { NextResponse } from 'next/server';
import { isGuestModeEnabled } from '@/lib/account/guest-mode';
import { consumeGuestTurn, guestMetricsSnapshot, recordGuestError } from '@/lib/server/guest-quota';
import { currentGuestId, resolveGuestScope } from '@/lib/server/guest-auth';

export const runtime = 'nodejs';

// 访客匿名统计：只统计数量、轮数、时长、错误率，不采集任何个人信息。
// GET  = 运行时快照（需管理员令牌 GUEST_ADMIN_TOKEN，未配置时不可读）
// POST = 访客端事件上报（自报进度/时长，仅计数，不落库）
export async function GET(request: Request) {
  if (!isGuestModeEnabled()) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const token = process.env.GUEST_ADMIN_TOKEN;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || new URL(request.url).searchParams.get('token') || '';
  if (!token || provided !== token) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(guestMetricsSnapshot(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!isGuestModeEnabled()) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const scope = await resolveGuestScope(`coach-metrics-${Date.now().toString(36)}`);
  if (!scope) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => null) as { event?: unknown } | null;
  const event = typeof body?.event === 'string' ? body.event.slice(0, 40) : '';
  if (event === 'guest_error') {
    recordGuestError();
    return NextResponse.json({ ok: true });
  }
  if (event === 'guest_turn') {
    // 保底计数（对话接口已计数，这里仅用于客户端主动补报的异常场景），失败静默。
    const guestId = await currentGuestId();
    if (guestId) consumeGuestTurn(guestId, 0);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
