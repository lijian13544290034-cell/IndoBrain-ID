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

const width = 1080;
const height = 1440;
const referenceImage = '/achievement-card-reference.png';

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

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
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
  drawText(context, label, 222, y + 32, '25px "Microsoft YaHei", sans-serif', '#202020');
  const valueFontSize = String(value).length > 3 ? 82 : 104;
  drawText(context, String(value), 220, y + 104, `700 ${valueFontSize}px "Arial", sans-serif`, '#004f46');
  drawText(context, unit, 222, y + 142, '24px "Microsoft YaHei", sans-serif', '#202020');
}

export async function renderAchievementCard(canvas: HTMLCanvasElement, data: AchievementCardData) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');

  const [template, qrDataUrl] = await Promise.all([
    loadImage(referenceImage),
    QRCode.toDataURL(data.referralQrUrl, { width: 216, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#0a0a0a', light: '#ffffff' } }),
  ]);
  context.drawImage(template, 0, 0, width, height);

  // The approved image stays as the fixed visual base. These opaque zones replace only
  // its sample values, sample slogan, and sample QR with the current learner's data.
  context.fillStyle = '#fffaf3';
  roundedRect(context, 54, 66, 500, 150, 34); context.fill();
  roundedRect(context, 48, 238, 760, 250, 36); context.fill();
  roundedRect(context, 46, 500, 500, data.streakDays ? 642 : 448, 32); context.fill();

  drawText(context, '●●●', 78, 130, '43px sans-serif', '#004f46');
  drawText(context, 'IndoBrain', 188, 142, '700 52px Arial, sans-serif', '#004f46');
  drawText(context, '真实场景 · 真实口语 · 真正敢开口', 188, 178, '19px "Microsoft YaHei", sans-serif', '#202020');

  const sloganFont = data.slogan.lines.length > 1 ? '700 49px "Microsoft YaHei", sans-serif' : '700 57px "Microsoft YaHei", sans-serif';
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
    drawStat(context, '▦', '连续学习', data.streakDays, '天', 972);
  }

  context.fillStyle = '#004b43';
  context.beginPath(); context.moveTo(0, 1190); context.quadraticCurveTo(240, 1330, 555, 1250); context.quadraticCurveTo(830, 1175, 1080, 1310); context.lineTo(1080, 1440); context.lineTo(0, 1440); context.closePath(); context.fill();
  context.fillStyle = 'rgba(255,255,255,0.13)'; context.fillRect(0, 1270, width, 170);
  drawText(context, '在 IndoBrain 学习印尼语', 102, 1327, '29px "Microsoft YaHei", sans-serif', '#ffffff');
  drawText(context, '每天一点点，真正融入印尼生活。', 102, 1371, '25px "Microsoft YaHei", sans-serif', '#ffffff');
  drawText(context, 'Real Life · Real Indonesian · Real You', 102, 1417, '20px Arial, sans-serif', '#f5be48');

  const qr = await loadImage(qrDataUrl);
  context.fillStyle = '#ffffff'; roundedRect(context, 572, 1240, 212, 212, 16); context.fill();
  context.drawImage(qr, 584, 1252, 188, 188);
  drawText(context, '扫码一起学习', 826, 1320, '25px "Microsoft YaHei", sans-serif', '#ffffff');
  drawText(context, '最真实的印尼语', 826, 1360, '22px "Microsoft YaHei", sans-serif', '#ffffff');
}

export default function AchievementCardPreview({ data, onReady }: { data: AchievementCardData; onReady?: (blob: Blob) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let cancelled = false;
    if (!canvas) return;
    renderAchievementCard(canvas, data)
      .then(() => new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image export failed')), 'image/png')))
      .then((blob) => { if (!cancelled) onReady?.(blob); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [data, onReady]);

  return <canvas ref={canvasRef} aria-label="IndoBrain 学习成果分享卡预览" className="h-auto w-full rounded-2xl border border-stone-200 bg-stone-100 shadow-sm" />;
}
