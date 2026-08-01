'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { AchievementCardSlogan } from '@/lib/achievement-card/slogans';

export type AchievementCardData = {
  masteredHarvestCount: number;
  completedExperienceCount: number;
  streakDays?: number;
  slogan: AchievementCardSlogan;
  referralQrUrl: string;
};

export type AchievementCardWarning = 'qr_generation_failed';
export type AchievementCardError =
  | 'template_load_failed'
  | 'template_decode_failed'
  | 'canvas_draw_failed'
  | 'blob_generation_failed';

const width = 1080;
const height = 1440;
const referenceImage = '/achievement-card-reference.png';
const minimumPngBytes = 20_000;

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.min(radius, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

async function loadImage(source: string) {
  const image = new Image();
  image.decoding = 'async';
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('image_load_failed'));
  });
  image.src = source;

  try {
    await loaded;
  } catch {
    throw new Error('template_load_failed');
  }

  if (typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      throw new Error('template_decode_failed');
    }
  }

  if (image.naturalWidth <= 0 || image.naturalHeight <= 0) throw new Error('template_decode_failed');
  return image;
}

function drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string) {
  context.font = font;
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function drawStat(context: CanvasRenderingContext2D, icon: string, label: string, value: number, unit: string, y: number) {
  context.fillStyle = 'rgba(255, 250, 244, 0.97)';
  roundedRect(context, 74, y, 112, 112, 24);
  context.fill();
  drawText(context, icon, 102, y + 74, '54px sans-serif', '#004f46');
  drawText(context, label, 222, y + 32, '25px "Microsoft YaHei", "PingFang SC", sans-serif', '#202020');
  const valueFontSize = String(value).length > 3 ? 82 : 104;
  drawText(context, String(value), 220, y + 104, `700 ${valueFontSize}px Arial, sans-serif`, '#004f46');
  drawText(context, unit, 222, y + 142, '24px "Microsoft YaHei", "PingFang SC", sans-serif', '#202020');
}

function assertCanvasHasContent(context: CanvasRenderingContext2D) {
  const pixels = context.getImageData(0, 0, width, height).data;
  for (let index = 0; index < pixels.length; index += 4_096) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];
    if (alpha > 0 && (red < 245 || green < 245 || blue < 245)) return;
  }
  throw new Error('canvas_draw_failed');
}

async function canvasToPng(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('blob_generation_failed')), 'image/png');
  });
  if (blob.size < minimumPngBytes) throw new Error('blob_generation_failed');
  return blob;
}

export async function renderAchievementCard(canvas: HTMLCanvasElement, data: AchievementCardData, onWarning?: (warning: AchievementCardWarning) => void) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas_draw_failed');

  context.clearRect(0, 0, width, height);
  const template = await loadImage(referenceImage);
  let qr: HTMLImageElement | null = null;
  try {
    const qrDataUrl = await QRCode.toDataURL(data.referralQrUrl, {
      width: 216,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0a0a0a', light: '#ffffff' },
    });
    qr = await loadImage(qrDataUrl);
  } catch {
    onWarning?.('qr_generation_failed');
  }

  try {
    context.drawImage(template, 0, 0, width, height);

    // Keep the approved design as the fixed base. These zones replace only its sample data.
    context.fillStyle = '#fffaf3';
    roundedRect(context, 54, 66, 500, 150, 34); context.fill();
    roundedRect(context, 48, 238, 760, 250, 36); context.fill();
    roundedRect(context, 46, 500, 500, data.streakDays ? 642 : 448, 32); context.fill();

    drawText(context, '💬', 78, 130, '43px sans-serif', '#004f46');
    drawText(context, 'IndoBrain', 188, 142, '700 52px Arial, sans-serif', '#004f46');
    drawText(context, '真实场景 · 真实口语 · 真正敢开口', 188, 178, '19px "Microsoft YaHei", "PingFang SC", sans-serif', '#202020');

    const sloganFont = data.slogan.lines.length > 1 ? '700 49px "Microsoft YaHei", "PingFang SC", sans-serif' : '700 57px "Microsoft YaHei", "PingFang SC", sans-serif';
    data.slogan.lines.forEach((line, index) => drawText(context, line, 70, 336 + index * 78, sloganFont, index === data.slogan.lines.length - 1 ? '#004f46' : '#171717'));
    context.fillStyle = '#ffb000';
    roundedRect(context, 72, 446, 250, 7, 4); context.fill();

    drawStat(context, '▣', '已经掌握', data.masteredHarvestCount, '个真实印尼语词汇/词组', 526);
    context.strokeStyle = '#d7bc8f'; context.setLineDash([5, 5]); context.lineWidth = 1;
    context.beginPath(); context.moveTo(74, 716); context.lineTo(426, 716); context.stroke(); context.setLineDash([]);
    drawStat(context, '⚑', '已经完成', data.completedExperienceCount, '个真实场景', 750);

    if (data.streakDays) {
      context.strokeStyle = '#d7bc8f'; context.setLineDash([5, 5]);
      context.beginPath(); context.moveTo(74, 940); context.lineTo(426, 940); context.stroke(); context.setLineDash([]);
      drawStat(context, '▣', '连续学习', data.streakDays, '天', 972);
    }

    context.fillStyle = '#004b43';
    context.beginPath(); context.moveTo(0, 1190); context.quadraticCurveTo(240, 1330, 555, 1250); context.quadraticCurveTo(830, 1175, 1080, 1310); context.lineTo(1080, 1440); context.lineTo(0, 1440); context.closePath(); context.fill();
    context.fillStyle = 'rgba(255,255,255,0.13)'; context.fillRect(0, 1270, width, 170);
    drawText(context, '在 IndoBrain 学习印尼语', 102, 1327, '29px "Microsoft YaHei", "PingFang SC", sans-serif', '#ffffff');
    drawText(context, '每天一点点，真正融入印尼生活。', 102, 1371, '25px "Microsoft YaHei", "PingFang SC", sans-serif', '#ffffff');
    drawText(context, 'Real Life · Real Indonesian · Real You', 102, 1417, '20px Arial, sans-serif', '#f5be48');

    context.fillStyle = '#ffffff'; roundedRect(context, 572, 1240, 212, 212, 16); context.fill();
    if (qr) {
      context.drawImage(qr, 584, 1252, 188, 188);
    } else {
      drawText(context, '二维码', 610, 1338, '28px "Microsoft YaHei", sans-serif', '#004b43');
      drawText(context, '暂不可用', 610, 1376, '22px "Microsoft YaHei", sans-serif', '#004b43');
    }
    drawText(context, '扫码一起学习', 826, 1320, '25px "Microsoft YaHei", "PingFang SC", sans-serif', '#ffffff');
    drawText(context, '最真实的印尼语', 826, 1360, '22px "Microsoft YaHei", "PingFang SC", sans-serif', '#ffffff');

    assertCanvasHasContent(context);
  } catch {
    throw new Error('canvas_draw_failed');
  }

  return canvasToPng(canvas).catch(() => { throw new Error('blob_generation_failed'); });
}

export default function AchievementCardPreview({ data, onReady, onError, onWarning }: {
  data: AchievementCardData;
  onReady?: (blob: Blob) => void;
  onError?: (error: AchievementCardError) => void;
  onWarning?: (warning: AchievementCardWarning) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let cancelled = false;
    if (!canvas) return;
    renderAchievementCard(canvas, data, onWarning)
      .then((blob) => { if (!cancelled) onReady?.(blob); })
      .catch((error: unknown) => {
        if (cancelled) return;
        const code = error instanceof Error && ['template_load_failed', 'template_decode_failed', 'canvas_draw_failed', 'blob_generation_failed'].includes(error.message)
          ? error.message as AchievementCardError
          : 'canvas_draw_failed';
        console.error(`[achievement-card] ${code}`);
        onError?.(code);
      });
    return () => { cancelled = true; };
  }, [data, onError, onReady, onWarning]);

  return <canvas ref={canvasRef} aria-label="IndoBrain 学习成果分享卡预览" className="h-auto w-full rounded-2xl border border-stone-200 bg-stone-100 shadow-sm" />;
}
