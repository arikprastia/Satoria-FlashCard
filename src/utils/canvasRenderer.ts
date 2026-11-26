import { CardState, WelcomeTheme } from "../types/card";
import { loadHtmlImage } from "./imageHelpers";
import satoriaGroupLogo from "../assets/logos/satoria-group.png";
import satoriaPharmaLogo from "../assets/logos/satoria-pharma.png";

export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 900;

interface PaletteConfig {
  titleColor: string;
  titleAccent: string;
  nameColor: string;
  labelColor: string;
  colonColor: string;
  valueColor: string;
  infoColor: string;
  bodyColor: string;
  dividerColor: string;
  accentBar: string;
  darkBg: boolean;
}

const LIGHT_BG_PALETTE: PaletteConfig = {
  titleColor: "#0F2942",
  titleAccent: "#B08016",
  nameColor: "#0F2942",
  labelColor: "#64748B",
  colonColor: "#94A3B8",
  valueColor: "#0F2942",
  infoColor: "#475569",
  bodyColor: "#253447",
  dividerColor: "rgba(15, 41, 66, 0.14)",
  accentBar: "#C59B27",
  darkBg: false,
};

const DARK_BG_PALETTE: PaletteConfig = {
  titleColor: "#FFFFFF",
  titleAccent: "#E5C158",
  nameColor: "#F0CD6E",
  labelColor: "#CBD5E1",
  colonColor: "#94A3B8",
  valueColor: "#FFFFFF",
  infoColor: "#CBD5E1",
  bodyColor: "#E2E8F0",
  dividerColor: "rgba(229, 193, 88, 0.28)",
  accentBar: "#D4AF37",
  darkBg: true,
};

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBatikOverlay(ctx: CanvasRenderingContext2D, strokeColor: string) {
  const tile = 72;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.6;
  for (let gx = -tile; gx < 520; gx += tile) {
    for (let gy = -tile; gy < CANVAS_HEIGHT + tile; gy += tile) {
      ctx.beginPath();
      ctx.moveTo(gx, gy - tile / 2);
      ctx.lineTo(gx + tile / 2, gy);
      ctx.lineTo(gx, gy + tile / 2);
      ctx.lineTo(gx - tile / 2, gy);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(gx, gy, 11, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawWelcomeBackground(
  ctx: CanvasRenderingContext2D,
  theme: WelcomeTheme
): PaletteConfig {
  if (theme === "navy-gold") {
    const baseGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    baseGrad.addColorStop(0, "#081726");
    baseGrad.addColorStop(0.55, "#0F2740");
    baseGrad.addColorStop(1, "#163556");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle geometric facets
    ctx.fillStyle = "rgba(212, 175, 55, 0.04)";
    ctx.beginPath();
    ctx.moveTo(960, 0);
    ctx.lineTo(1600, 0);
    ctx.lineTo(1320, 380);
    ctx.closePath();
    ctx.fill();

    // Left diagonal gold-navy motif panel
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(445, 0);
    ctx.lineTo(345, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    const panelGrad = ctx.createLinearGradient(0, 0, 440, CANVAS_HEIGHT);
    panelGrad.addColorStop(0, "#B88A24");
    panelGrad.addColorStop(1, "#7B570E");
    ctx.fillStyle = panelGrad;
    ctx.fill();
    ctx.clip();
    drawBatikOverlay(ctx, "rgba(255, 248, 224, 0.16)");
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(445, 0);
    ctx.lineTo(345, CANVAS_HEIGHT);
    ctx.strokeStyle = "#E5C35C";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    return DARK_BG_PALETTE;
  }

  if (theme === "pharma-mint") {
    const baseGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    baseGrad.addColorStop(0, "#F7FCFA");
    baseGrad.addColorStop(0.6, "#EAF7F3");
    baseGrad.addColorStop(1, "#D8EFE8");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(445, 0);
    ctx.lineTo(345, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    const panelGrad = ctx.createLinearGradient(0, 0, 440, CANVAS_HEIGHT);
    panelGrad.addColorStop(0, "#0F766E");
    panelGrad.addColorStop(1, "#0B4F4A");
    ctx.fillStyle = panelGrad;
    ctx.fill();
    ctx.clip();
    drawBatikOverlay(ctx, "rgba(255, 255, 255, 0.13)");
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(445, 0);
    ctx.lineTo(345, CANVAS_HEIGHT);
    ctx.strokeStyle = "#2DD4BF";
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.restore();

    return {
      ...LIGHT_BG_PALETTE,
      titleColor: "#0E3A3A",
      titleAccent: "#0F766E",
      nameColor: "#0F766E",
      valueColor: "#0E3A3A",
      accentBar: "#0D9488",
      dividerColor: "rgba(15, 118, 110, 0.18)",
    };
  }

  if (theme === "warm-executive") {
    const baseGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    baseGrad.addColorStop(0, "#FFFBF6");
    baseGrad.addColorStop(0.55, "#F9F1E6");
    baseGrad.addColorStop(1, "#F1E3D0");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(445, 0);
    ctx.lineTo(345, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    const panelGrad = ctx.createLinearGradient(0, 0, 440, CANVAS_HEIGHT);
    panelGrad.addColorStop(0, "#9A6B2F");
    panelGrad.addColorStop(1, "#6C4618");
    ctx.fillStyle = panelGrad;
    ctx.fill();
    ctx.clip();
    drawBatikOverlay(ctx, "rgba(255, 245, 228, 0.15)");
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(445, 0);
    ctx.lineTo(345, CANVAS_HEIGHT);
    ctx.strokeStyle = "#D4A359";
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.restore();

    return {
      ...LIGHT_BG_PALETTE,
      titleColor: "#2B1E12",
      titleAccent: "#9A6B2F",
      nameColor: "#8C5B20",
      valueColor: "#2B1E12",
      accentBar: "#B47B38",
      dividerColor: "rgba(154, 107, 47, 0.2)",
    };
  }

  // Default: ivory-gold (baku)
  const baseGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  baseGrad.addColorStop(0, "#FEFCF8");
  baseGrad.addColorStop(0.55, "#FAF7F0");
  baseGrad.addColorStop(1, "#F4EFE4");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const facets: Array<{ pts: Array<[number, number]>; fill: string }> = [
    { pts: [[420, 0], [880, 0], [640, 290]], fill: "rgba(15, 41, 66, 0.022)" },
    { pts: [[880, 0], [1340, 0], [1080, 260]], fill: "rgba(184, 134, 11, 0.025)" },
    { pts: [[1340, 0], [1600, 0], [1600, 380], [1160, 210]], fill: "rgba(15, 41, 66, 0.028)" },
    { pts: [[1160, 210], [1600, 380], [1420, 690]], fill: "rgba(184, 134, 11, 0.02)" },
    { pts: [[520, 900], [980, 900], [740, 670]], fill: "rgba(15, 41, 66, 0.02)" },
    { pts: [[1180, 900], [1600, 620], [1600, 900]], fill: "rgba(184, 134, 11, 0.032)" },
  ];

  for (const facet of facets) {
    ctx.beginPath();
    facet.pts.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = facet.fill;
    ctx.fill();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(197, 155, 39, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(1280, 0);
  ctx.lineTo(1600, 320);
  ctx.moveTo(1350, 0);
  ctx.lineTo(1600, 250);
  ctx.moveTo(1180, 900);
  ctx.lineTo(1600, 520);
  ctx.stroke();

  ctx.strokeStyle = "rgba(15, 41, 66, 0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(460, 0);
  ctx.lineTo(940, 900);
  ctx.moveTo(1060, 0);
  ctx.lineTo(1540, 900);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(445, 0);
  ctx.lineTo(345, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();

  const panelGrad = ctx.createLinearGradient(0, 0, 440, CANVAS_HEIGHT);
  panelGrad.addColorStop(0, "#C99E36");
  panelGrad.addColorStop(0.5, "#B0821B");
  panelGrad.addColorStop(1, "#8A610C");
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.clip();
  drawBatikOverlay(ctx, "rgba(255, 248, 224, 0.17)");
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(445, 0);
  ctx.lineTo(345, CANVAS_HEIGHT);
  ctx.strokeStyle = "#E5C35C";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(463, 0);
  ctx.lineTo(363, CANVAS_HEIGHT);
  ctx.strokeStyle = "rgba(15, 41, 66, 0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  return LIGHT_BG_PALETTE;
}

function drawBirthdayBackground(
  ctx: CanvasRenderingContext2D,
  theme: CardState["birthdayTheme"]
): PaletteConfig {
  if (theme === "navy-gold") {
    const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    grad.addColorStop(0, "#081726");
    grad.addColorStop(0.55, "#0F2740");
    grad.addColorStop(1, "#163556");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const glow = ctx.createRadialGradient(310, 450, 40, 310, 450, 420);
    glow.addColorStop(0, "rgba(212, 175, 55, 0.22)");
    glow.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
    ctx.lineWidth = 1.2;
    for (let x = 0; x < CANVAS_WIDTH + 400; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 360, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(229, 195, 92, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(150, 0);
    ctx.moveTo(1430, CANVAS_HEIGHT);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 170);
    ctx.stroke();
    ctx.restore();

    return DARK_BG_PALETTE;
  }

  if (theme === "pharma-mint") {
    const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    grad.addColorStop(0, "#F5FCFA");
    grad.addColorStop(0.6, "#E6F6F2");
    grad.addColorStop(1, "#D2EDE6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(390, 0);
    ctx.lineTo(295, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    const sideGrad = ctx.createLinearGradient(0, 0, 390, CANVAS_HEIGHT);
    sideGrad.addColorStop(0, "#0F766E");
    sideGrad.addColorStop(1, "#0B4F4A");
    ctx.fillStyle = sideGrad;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(15, 118, 110, 0.09)";
    ctx.lineWidth = 1.6;
    const hexPositions: Array<[number, number, number]> = [
      [1460, 740, 88],
      [1330, 820, 62],
      [1520, 590, 56],
      [530, 95, 52],
    ];
    for (const [cx, cy, r] of hexPositions) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    return {
      ...LIGHT_BG_PALETTE,
      titleColor: "#0E3A3A",
      titleAccent: "#0F766E",
      nameColor: "#0F766E",
      infoColor: "#2C5E5C",
      bodyColor: "#1F4443",
      dividerColor: "rgba(15, 118, 110, 0.2)",
      accentBar: "#0D9488",
    };
  }

  if (theme === "warm-festive") {
    const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    grad.addColorStop(0, "#FFFBF6");
    grad.addColorStop(0.55, "#FDF1E4");
    grad.addColorStop(1, "#F7DFC8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(360, 0);
    ctx.lineTo(260, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    const leftGrad = ctx.createLinearGradient(0, 0, 350, CANVAS_HEIGHT);
    leftGrad.addColorStop(0, "#D97706");
    leftGrad.addColorStop(1, "#9A3412");
    ctx.fillStyle = leftGrad;
    ctx.fill();
    ctx.restore();

    const confetti: Array<{
      x: number;
      y: number;
      size: number;
      rot: number;
      color: string;
    }> = [
      { x: 520, y: 85, size: 12, rot: 0.4, color: "rgba(217, 119, 6, 0.22)" },
      { x: 640, y: 120, size: 8, rot: 0.9, color: "rgba(224, 122, 95, 0.25)" },
      { x: 1080, y: 90, size: 11, rot: 0.2, color: "rgba(197, 155, 39, 0.25)" },
      { x: 1480, y: 240, size: 14, rot: 0.6, color: "rgba(217, 119, 6, 0.2)" },
      { x: 1420, y: 790, size: 15, rot: 0.3, color: "rgba(224, 122, 95, 0.24)" },
      { x: 1290, y: 830, size: 9, rot: 1.1, color: "rgba(197, 155, 39, 0.28)" },
      { x: 560, y: 825, size: 11, rot: 0.7, color: "rgba(217, 119, 6, 0.2)" },
      { x: 930, y: 835, size: 10, rot: 0.5, color: "rgba(224, 122, 95, 0.22)" },
    ];
    for (const c of confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    }

    return {
      ...LIGHT_BG_PALETTE,
      titleColor: "#1E293B",
      titleAccent: "#B45309",
      nameColor: "#B45309",
      infoColor: "#64442C",
      bodyColor: "#334155",
      dividerColor: "rgba(180, 83, 9, 0.2)",
      accentBar: "#D97706",
    };
  }

  // Default: royal-gold
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, "#FEFCF7");
  grad.addColorStop(0.55, "#F9F3E4");
  grad.addColorStop(1, "#EFE2C4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const bokehs: Array<[number, number, number, string]> = [
    [1390, 740, 190, "rgba(212, 175, 55, 0.16)"],
    [1490, 610, 120, "rgba(197, 155, 39, 0.12)"],
    [1220, 840, 140, "rgba(229, 193, 88, 0.14)"],
    [610, 110, 130, "rgba(212, 175, 55, 0.1)"],
    [220, 140, 210, "rgba(197, 155, 39, 0.15)"],
  ];
  for (const [bx, by, br, col] of bokehs) {
    const rGrad = ctx.createRadialGradient(bx, by, 5, bx, by, br);
    rGrad.addColorStop(0, col);
    rGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(184, 134, 11, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(36, 36, CANVAS_WIDTH - 72, CANVAS_HEIGHT - 72);
  ctx.strokeStyle = "rgba(15, 41, 66, 0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, CANVAS_WIDTH - 96, CANVAS_HEIGHT - 96);
  ctx.restore();

  return {
    ...LIGHT_BG_PALETTE,
    nameColor: "#A67712",
    dividerColor: "rgba(176, 128, 22, 0.25)",
  };
}

async function drawAiCustomBackground(
  ctx: CanvasRenderingContext2D,
  bgDataUrl: string,
  textTone: CardState["aiBgTextTone"]
): Promise<PaletteConfig> {
  const img = await loadHtmlImage(bgDataUrl);
  const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const offsetX = (CANVAS_WIDTH - drawW) / 2;
  const offsetY = (CANVAS_HEIGHT - drawH) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  // Subtle readability scrim across the right content column
  const scrim = ctx.createLinearGradient(440, 0, CANVAS_WIDTH, 0);
  if (textTone === "light") {
    scrim.addColorStop(0, "rgba(8, 20, 36, 0.15)");
    scrim.addColorStop(0.25, "rgba(8, 20, 36, 0.56)");
    scrim.addColorStop(1, "rgba(8, 20, 36, 0.68)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return DARK_BG_PALETTE;
  } else {
    scrim.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    scrim.addColorStop(0.25, "rgba(255, 253, 248, 0.62)");
    scrim.addColorStop(1, "rgba(255, 253, 248, 0.76)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return LIGHT_BG_PALETTE;
  }
}

async function drawCompanyLogo(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  darkBg: boolean
) {
  const baseRightEdge = 1506 + state.logoOffsetX;
  const baseTopY = (state.logoMode === "satoria-pharma" ? 44 : 52) + state.logoOffsetY;
  const scale = state.logoScale;

  let logoSrc: string;
  let maxW: number;
  let maxH: number;

  if (state.logoMode === "custom" && state.customLogoDataUrl) {
    logoSrc = state.customLogoDataUrl;
    maxW = 260 * scale;
    maxH = 105 * scale;
  } else if (state.logoMode === "satoria-pharma") {
    logoSrc = satoriaPharmaLogo;
    maxW = 190 * scale;
    maxH = 138 * scale;
  } else {
    logoSrc = satoriaGroupLogo;
    maxW = 268 * scale;
    maxH = 98 * scale;
  }

  try {
    const logoImg = await loadHtmlImage(logoSrc);
    const fit = Math.min(maxW / logoImg.width, maxH / logoImg.height);
    const drawW = logoImg.width * fit;
    const drawH = logoImg.height * fit;
    const drawX = baseRightEdge - drawW;
    const drawY = baseTopY;

    if (darkBg) {
      const padFactor = Math.min(scale, 1.45);
      const padX = 18 * padFactor;
      const padY = 11 * padFactor;
      const boxRadius = 14 * padFactor;

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      drawRoundedRectPath(
        ctx,
        drawX - padX,
        drawY - padY,
        drawW + padX * 2,
        drawH + padY * 2,
        boxRadius
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
  } catch {
    // Graceful skip if an uploaded logo fails to decode
  }
}

async function drawPhotoFrame(ctx: CanvasRenderingContext2D, state: CardState) {
  const frameX = 112;
  const frameY = 158;
  const frameW = 396;
  const frameH = 584;
  const pad = 18;
  const innerX = frameX + pad;
  const innerY = frameY + pad;
  const innerW = frameW - pad * 2;
  const innerH = frameH - pad * 2;

  ctx.save();
  ctx.shadowColor = "rgba(10, 22, 38, 0.26)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 16;
  drawRoundedRectPath(ctx, frameX, frameY, frameW, frameH, 16);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, frameX, frameY, frameW, frameH, 16);
  ctx.strokeStyle = "rgba(15, 41, 66, 0.1)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, innerX, innerY, innerW, innerH, 8);
  ctx.clip();

  if (state.currentPhotoDataUrl) {
    try {
      const img = await loadHtmlImage(state.currentPhotoDataUrl);
      const baseScale = Math.max(innerW / img.width, innerH / img.height);
      const finalScale = baseScale * state.photoZoom;
      const drawW = img.width * finalScale;
      const drawH = img.height * finalScale;

      const centerX = innerX + innerW / 2 + state.photoOffsetX * 1.5;
      const centerY = innerY + innerH / 2 + state.photoOffsetY * 1.5;

      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(innerX, innerY, innerW, innerH);
      ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
      ctx.restore();
      return;
    } catch {
      // Fallback placeholder
    }
  }

  const phGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
  phGrad.addColorStop(0, "#EEF2F6");
  phGrad.addColorStop(1, "#E2E8F0");
  ctx.fillStyle = phGrad;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  const cx = innerX + innerW / 2;
  const cy = innerY + innerH / 2 - 22;
  ctx.fillStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.arc(cx, cy - 36, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + 78, 84, 62, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#64748B";
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("Unggah Foto Karyawan", cx, innerY + innerH - 54);
  ctx.restore();
}

function buildCanvasFont(
  fontFamily: string,
  sizePx: number,
  weight = 700
): string {
  const isScript =
    fontFamily === "Caveat" ||
    fontFamily === "Great Vibes" ||
    fontFamily === "Dancing Script" ||
    fontFamily === "Pacifico" ||
    fontFamily === "Sacramento" ||
    fontFamily === "Kalam";
  const isSans =
    fontFamily === "Plus Jakarta Sans" ||
    fontFamily === "DM Sans" ||
    fontFamily === "Montserrat" ||
    fontFamily === "Poppins" ||
    fontFamily === "Space Grotesk";
  const fallback = isScript
    ? "cursive"
    : isSans
      ? "sans-serif"
      : "Georgia, serif";
  const singleWeight =
    fontFamily === "Great Vibes" ||
    fontFamily === "Pacifico" ||
    fontFamily === "Sacramento" ||
    fontFamily === "DM Serif Display";
  const effectiveWeight = singleWeight ? 400 : weight;
  return `${effectiveWeight} ${sizePx}px "${fontFamily}", ${fallback}`;
}

function fitDynamicFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  initialSize: number,
  minSize = 36,
  weight = 700
): number {
  let size = initialSize;
  while (size > minSize) {
    ctx.font = buildCanvasFont(fontFamily, size, weight);
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 2;
  }
  return minSize;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
  }
  return lines;
}

export function formatIndonesianDate(isoDate: string): string {
  const trimmed = isoDate.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return trimmed;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const dateObj = new Date(year, month, day);
  if (Number.isNaN(dateObj.getTime())) return trimmed;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

function drawWelcomeContent(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  palette: PaletteConfig
) {
  const startX = 576;
  const maxContentW = 924;

  ctx.fillStyle = palette.accentBar;
  ctx.fillRect(startX, 148, 72, 4);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const titleScale = state.titleFontScale ?? 1;
  const nameScale = state.nameFontScale ?? 1;

  const titleSize1 = fitDynamicFontSize(
    ctx,
    "Welcome",
    state.titleFont,
    maxContentW,
    Math.round(78 * titleScale),
    36,
    800
  );
  const titleSize2 = fitDynamicFontSize(
    ctx,
    "On Board!",
    state.titleFont,
    maxContentW,
    Math.round(82 * titleScale),
    36,
    800
  );

  ctx.fillStyle = palette.titleColor;
  ctx.font = buildCanvasFont(state.titleFont, titleSize1, 800);
  ctx.fillText("Welcome", startX, 232);
  ctx.fillStyle = palette.titleAccent;
  ctx.font = buildCanvasFont(state.titleFont, titleSize2, 800);
  ctx.fillText("On Board!", startX, 316);

  const rawName = state.welcomeName.trim();
  const displayName = rawName || "Nama Karyawan";
  const isScriptName =
    state.nameFont === "Caveat" ||
    state.nameFont === "Great Vibes" ||
    state.nameFont === "Dancing Script" ||
    state.nameFont === "Pacifico" ||
    state.nameFont === "Sacramento" ||
    state.nameFont === "Kalam";
  const baseNameSize = Math.round((isScriptName ? 74 : 56) * nameScale);
  const nameSize = fitDynamicFontSize(
    ctx,
    displayName,
    state.nameFont,
    maxContentW,
    baseNameSize,
    26,
    700
  );
  ctx.font = buildCanvasFont(state.nameFont, nameSize, 700);
  ctx.save();
  if (!rawName) ctx.globalAlpha = 0.35;
  ctx.fillStyle = palette.nameColor;
  ctx.fillText(displayName, startX, 412);
  ctx.restore();

  ctx.fillStyle = palette.dividerColor;
  ctx.fillRect(startX, 446, maxContentW, 1.5);

  const companyName =
    state.companyOption === "manual"
      ? state.customCompanyName.trim()
      : state.companyOption;

  const formattedJoinDate = formatIndonesianDate(state.joinDate);

  const rows: Array<[string, string]> = [
    ["Company Name", companyName],
    ["Position", state.position.trim()],
    ["Join Date", formattedJoinDate],
    ["Email", state.email.trim()],
    ["Placement", state.placement.trim()],
  ];

  const dataFont = state.welcomeDataFont || "Plus Jakarta Sans";
  const dataScale = state.welcomeDataFontScale ?? 1;
  const isScriptData =
    dataFont === "Caveat" ||
    dataFont === "Great Vibes" ||
    dataFont === "Dancing Script" ||
    dataFont === "Pacifico" ||
    dataFont === "Sacramento" ||
    dataFont === "Kalam";
  const labelOpticalBump = isScriptData ? 5 : dataFont === "Cormorant Garamond" ? 3 : 0;
  const labelSize = Math.round((22 + labelOpticalBump) * dataScale);
  const baseValSize = Math.round((23 + labelOpticalBump) * dataScale);

  ctx.font = buildCanvasFont(dataFont, labelSize, 600);
  const maxMeasuredLabelW = rows.reduce((max, [lbl]) => {
    return Math.max(max, ctx.measureText(lbl).width);
  }, 0);

  const labelX = startX;
  const colonX = startX + Math.max(198, Math.min(340, Math.ceil(maxMeasuredLabelW) + 20));
  const valueX = colonX + 26;
  const valueMaxW = Math.max(240, startX + maxContentW - valueX);

  let currentY = 508;
  const rowStep = Math.round(58 * Math.max(0.84, Math.min(1.22, dataScale)));

  for (const [label, value] of rows) {
    ctx.font = buildCanvasFont(dataFont, labelSize, 600);
    ctx.fillStyle = palette.labelColor;
    ctx.fillText(label, labelX, currentY);

    ctx.fillStyle = palette.colonColor;
    ctx.fillText(":", colonX, currentY);

    if (value) {
      let valFontSize = baseValSize;
      ctx.font = buildCanvasFont(dataFont, valFontSize, 600);
      while (valFontSize > 14 && ctx.measureText(value).width > valueMaxW) {
        valFontSize -= 1;
        ctx.font = buildCanvasFont(dataFont, valFontSize, 600);
      }
      ctx.fillStyle = palette.valueColor;
      ctx.fillText(value, valueX, currentY);
    }

    currentY += rowStep;
  }
}

function drawBirthdayContent(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  palette: PaletteConfig
) {
  const startX = 576;
  const maxContentW = 920;

  ctx.fillStyle = palette.accentBar;
  ctx.fillRect(startX, 162, 72, 4);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const titleScale = state.titleFontScale ?? 1;
  const nameScale = state.nameFontScale ?? 1;

  const titleSize1 = fitDynamicFontSize(
    ctx,
    "Happy",
    state.titleFont,
    maxContentW,
    Math.round(80 * titleScale),
    36,
    800
  );
  const titleSize2 = fitDynamicFontSize(
    ctx,
    "Birthday!",
    state.titleFont,
    maxContentW,
    Math.round(84 * titleScale),
    36,
    800
  );

  ctx.fillStyle = palette.titleColor;
  ctx.font = buildCanvasFont(state.titleFont, titleSize1, 800);
  ctx.fillText("Happy", startX, 248);
  ctx.fillStyle = palette.titleAccent;
  ctx.font = buildCanvasFont(state.titleFont, titleSize2, 800);
  ctx.fillText("Birthday!", startX, 334);

  const rawName = state.birthdayName.trim();
  const displayName = rawName || "Nama Karyawan";
  const isScriptName =
    state.nameFont === "Caveat" ||
    state.nameFont === "Great Vibes" ||
    state.nameFont === "Dancing Script" ||
    state.nameFont === "Pacifico" ||
    state.nameFont === "Sacramento" ||
    state.nameFont === "Kalam";
  const baseNameSize = Math.round((isScriptName ? 76 : 56) * nameScale);
  const nameSize = fitDynamicFontSize(
    ctx,
    displayName,
    state.nameFont,
    maxContentW,
    baseNameSize,
    26,
    700
  );
  ctx.font = buildCanvasFont(state.nameFont, nameSize, 700);
  ctx.save();
  if (!rawName) ctx.globalAlpha = 0.35;
  ctx.fillStyle = palette.nameColor;
  ctx.fillText(displayName, startX, 434);
  ctx.restore();

  const bodyFont = state.birthdayBodyFont || "Plus Jakarta Sans";
  const bodyScale = state.birthdayBodyFontScale ?? 1;
  const isScriptBody =
    bodyFont === "Caveat" ||
    bodyFont === "Great Vibes" ||
    bodyFont === "Dancing Script" ||
    bodyFont === "Pacifico" ||
    bodyFont === "Sacramento" ||
    bodyFont === "Kalam";
  const bodyBump = isScriptBody ? 6 : bodyFont === "Cormorant Garamond" ? 4 : 0;

  const ageStr = state.age.trim();
  const placementStr = state.birthdayPlacement.trim();
  let infoText = "";
  if (state.showAge && ageStr && placementStr) {
    infoText = `${ageStr} Tahun  •  ${placementStr}`;
  } else if (state.showAge && ageStr) {
    infoText = `${ageStr} Tahun`;
  } else if (placementStr) {
    infoText = placementStr;
  }

  if (infoText) {
    const infoSize = Math.round((23 + Math.min(bodyBump, 4)) * bodyScale);
    ctx.font = buildCanvasFont(bodyFont, infoSize, 600);
    ctx.fillStyle = palette.infoColor;
    ctx.fillText(infoText, startX, 492);
  }

  ctx.fillStyle = palette.dividerColor;
  ctx.fillRect(startX, 524, maxContentW, 1.5);

  const wishText = state.birthdayWish.trim();
  if (wishText) {
    const wishSize = Math.round((25 + bodyBump) * bodyScale);
    ctx.font = buildCanvasFont(bodyFont, wishSize, 500);
    ctx.fillStyle = palette.bodyColor;
    const lines = wrapTextLines(ctx, wishText, maxContentW).slice(0, 6);

    let textY = 582;
    const lineHeight = Math.round((isScriptBody ? 45 : 42) * Math.max(0.84, Math.min(1.35, bodyScale)));
    for (const line of lines) {
      if (textY > CANVAS_HEIGHT - 36) break;
      ctx.fillText(line, startX, textY);
      textY += lineHeight;
    }
  }
}

export async function renderFlashCardCanvas(
  canvas: HTMLCanvasElement,
  state: CardState
): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (state.mode === "welcome") {
    let palette: PaletteConfig;
    if (state.aiWelcomeBgDataUrl) {
      try {
        palette = await drawAiCustomBackground(
          ctx,
          state.aiWelcomeBgDataUrl,
          state.aiBgTextTone
        );
      } catch {
        palette = drawWelcomeBackground(ctx, state.welcomeTheme);
      }
    } else {
      palette = drawWelcomeBackground(ctx, state.welcomeTheme);
    }

    await drawCompanyLogo(ctx, state, palette.darkBg);
    await drawPhotoFrame(ctx, state);
    drawWelcomeContent(ctx, state, palette);
  } else {
    let palette: PaletteConfig;
    if (state.aiBirthdayBgDataUrl) {
      try {
        palette = await drawAiCustomBackground(
          ctx,
          state.aiBirthdayBgDataUrl,
          state.aiBgTextTone
        );
      } catch {
        palette = drawBirthdayBackground(ctx, state.birthdayTheme);
      }
    } else {
      palette = drawBirthdayBackground(ctx, state.birthdayTheme);
    }

    await drawCompanyLogo(ctx, state, palette.darkBg);
    await drawPhotoFrame(ctx, state);
    drawBirthdayContent(ctx, state, palette);
  }
}
