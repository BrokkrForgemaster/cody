import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 675;
const FRAMES = 42;
const FRAME_DELAY = 70;
const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'images');
const OUTPUT_GIF = path.join(OUTPUT_DIR, 'forged-customs-logo-epic-v2.gif');
const OUTPUT_POSTER = path.join(OUTPUT_DIR, 'forged-customs-logo-epic-v2-poster.png');

const STAGE = {
  fcY: 84,
  forgedY: 258,
  customsY: 396,
  taglineY: 480,
  lineY: 392
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function impactDrop(frame, start, duration, fromY, overshoot = 12) {
  const progress = clamp((frame - start) / duration, 0, 1);
  if (progress <= 0) {
    return { y: fromY, opacity: 0 };
  }
  const eased = easeOutQuint(progress);
  const baseY = fromY * (1 - eased);
  const bounce = progress < 1 ? Math.sin(progress * Math.PI * 3.6) * overshoot * (1 - progress) : 0;
  return {
    y: Math.round(baseY + bounce),
    opacity: clamp(progress * 1.4, 0, 1)
  };
}

function reveal(frame, start, duration) {
  return clamp((frame - start) / duration, 0, 1);
}

function svg(input) {
  return Buffer.from(input, 'utf8');
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

async function getLatestGeneratedBackground() {
  const generatedRoot = path.join(process.env.USERPROFILE ?? '', '.codex', 'generated_images');

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      if (!entry.isFile() || !/\.png$/i.test(entry.name)) {
        return [];
      }
      const stats = await fs.stat(fullPath);
      return [{ fullPath, mtimeMs: stats.mtimeMs }];
    }));
    return nested.flat();
  }

  try {
    const files = await walk(generatedRoot);
    return files.sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.fullPath ?? null;
  } catch {
    return null;
  }
}

async function loadBackground() {
  const backgroundPath = await getLatestGeneratedBackground();
  if (!backgroundPath) {
    return { backgroundPath: null, buffer: null, meta: null };
  }

  const buffer = await sharp(backgroundPath)
    .resize(Math.round(WIDTH * 1.18), Math.round(HEIGHT * 1.18), { fit: 'cover' })
    .modulate({ brightness: 0.58, saturation: 1.12 })
    .blur(1)
    .png()
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  return { backgroundPath, buffer, meta };
}

function backgroundCrop(meta, frame) {
  const t = frame / (FRAMES - 1);
  const overflowX = (meta?.width ?? WIDTH) - WIDTH;
  const overflowY = (meta?.height ?? HEIGHT) - HEIGHT;
  return {
    left: clamp(Math.round((overflowX / 2) + Math.sin(t * Math.PI * 2) * overflowX * 0.18), 0, overflowX),
    top: clamp(Math.round((overflowY / 2) + Math.cos((t * Math.PI * 2) * 0.7) * overflowY * 0.16), 0, overflowY),
    width: WIDTH,
    height: HEIGHT
  };
}

function backdropOverlay(frame) {
  const t = frame / (FRAMES - 1);
  const redCore = 0.22 + Math.sin(t * Math.PI * 2.3) * 0.05;
  const sweepX = -380 + t * 560;

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <radialGradient id="vignette" cx="50%" cy="42%" r="72%">
          <stop offset="0%" stop-color="#2a0907" stop-opacity="0.16"/>
          <stop offset="55%" stop-color="#090909" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
        </radialGradient>
        <radialGradient id="coreGlow" cx="50%" cy="42%" r="38%">
          <stop offset="0%" stop-color="#ff1d0d" stop-opacity="${redCore.toFixed(3)}"/>
          <stop offset="55%" stop-color="#6a0606" stop-opacity="0.09"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="steelSweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#vignette)"/>
      <rect width="100%" height="100%" fill="url(#coreGlow)"/>
      <g opacity="0.18" transform="translate(${sweepX.toFixed(2)} 0) skewX(-20)">
        <rect x="0" y="-80" width="90" height="${HEIGHT + 160}" fill="url(#steelSweep)" filter="url(#soften)"/>
      </g>
    </svg>
  `);
}

function smokeOverlay(frame) {
  const rng = createRng(9000 + frame * 17);
  const puffs = [];
  const smokeOpacity = frame < 30 ? 0.58 : 0.42;

  for (let index = 0; index < 16; index += 1) {
    const side = index % 2 === 0 ? 1 : -1;
    const anchorX = side > 0 ? 860 : 340;
    const anchorY = index < 8 ? 170 : 400;
    const x = anchorX + (rng() - 0.5) * 220;
    const y = anchorY + (rng() - 0.5) * 120 - frame * (0.9 + rng() * 0.8);
    const rx = 56 + rng() * 110;
    const ry = 26 + rng() * 56;
    const alpha = smokeOpacity * (0.18 + rng() * 0.25);
    puffs.push(`<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="#d0d0d0" opacity="${alpha.toFixed(3)}"/>`);
  }

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <filter id="smokeBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="24"/>
        </filter>
      </defs>
      <g filter="url(#smokeBlur)">
        ${puffs.join('')}
      </g>
    </svg>
  `);
}

function sparksOverlay(frame) {
  const rng = createRng(1337 + frame * 31);
  const sparks = [];

  for (let index = 0; index < 28; index += 1) {
    const burst = frame >= 6 && frame <= 18;
    const zone = burst ? 0.5 : 1;
    const x = 160 + rng() * 880;
    const y = 120 + rng() * 430;
    const length = 8 + rng() * 30;
    const angle = -25 + rng() * 50;
    const alpha = (burst ? 0.18 : 0.08) + rng() * 0.28 * zone;
    sparks.push(`
      <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})">
        <rect x="0" y="0" width="${length.toFixed(2)}" height="${(1.1 + rng() * 2.2).toFixed(2)}" rx="2" fill="${rng() > 0.8 ? '#ffd37f' : '#ff3b18'}" opacity="${alpha.toFixed(3)}"/>
      </g>
    `);
  }

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <filter id="sparkBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.9"/>
        </filter>
      </defs>
      <g filter="url(#sparkBlur)">
        ${sparks.join('')}
      </g>
    </svg>
  `);
}

function impactFlash(frame) {
  const fcImpact = clamp(1 - Math.abs(frame - 7) / 4, 0, 1);
  const forgedImpact = clamp(1 - Math.abs(frame - 16) / 4, 0, 1);
  const customsImpact = clamp(1 - Math.abs(frame - 24) / 4, 0, 1);

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <filter id="flashBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18"/>
        </filter>
      </defs>
      <g filter="url(#flashBlur)">
        <ellipse cx="600" cy="190" rx="${(140 + fcImpact * 220).toFixed(2)}" ry="${(14 + fcImpact * 30).toFixed(2)}" fill="#ffffff" opacity="${(fcImpact * 0.42).toFixed(3)}"/>
        <ellipse cx="600" cy="350" rx="${(180 + forgedImpact * 260).toFixed(2)}" ry="${(18 + forgedImpact * 30).toFixed(2)}" fill="#ffffff" opacity="${(forgedImpact * 0.34).toFixed(3)}"/>
        <ellipse cx="600" cy="418" rx="${(160 + customsImpact * 240).toFixed(2)}" ry="${(12 + customsImpact * 24).toFixed(2)}" fill="#ff3c18" opacity="${(customsImpact * 0.36).toFixed(3)}"/>
      </g>
    </svg>
  `);
}

function baseDefs() {
  return `
    <defs>
      <linearGradient id="steel" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f7f7f7"/>
        <stop offset="0.18" stop-color="#858585"/>
        <stop offset="0.52" stop-color="#242424"/>
        <stop offset="0.78" stop-color="#b7b7b7"/>
        <stop offset="1" stop-color="#343434"/>
      </linearGradient>
      <linearGradient id="redSteel" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#ff3a3a"/>
        <stop offset="0.34" stop-color="#c1121f"/>
        <stop offset="0.68" stop-color="#5d0409"/>
        <stop offset="1" stop-color="#e51b25"/>
      </linearGradient>
      <linearGradient id="edge" x1="0" x2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.48" stop-color="#5c5c5c"/>
        <stop offset="1" stop-color="#ffffff"/>
      </linearGradient>
      <pattern id="scratches" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
        <path d="M2 8h22M9 18h18M0 29h30" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
        <path d="M6 3h16M11 24h13" stroke="#000000" stroke-opacity="0.22" stroke-width="1"/>
      </pattern>
      <filter id="softShadow" x="-25%" y="-35%" width="150%" height="190%">
        <feDropShadow dx="0" dy="14" stdDeviation="9" flood-color="#000000" flood-opacity="0.88"/>
        <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#c1121f" flood-opacity="0.22"/>
      </filter>
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="14"/>
      </filter>
      <style>
        .mark,
        .word {
          font-family: Impact, "Arial Black", "Bebas Neue", sans-serif;
          font-style: italic;
          font-weight: 900;
        }
        .wide {
          font-family: "Arial Narrow", Impact, sans-serif;
          font-weight: 700;
          letter-spacing: 28px;
        }
        .tag {
          font-family: "Arial Narrow", Arial, sans-serif;
          font-weight: 700;
          letter-spacing: 18px;
        }
      </style>
    </defs>
  `;
}

function fcLayer(frame) {
  const F = impactDrop(frame, 1, 7, -260, 18);
  const C = impactDrop(frame, 4, 7, -260, 18);
  const shine = clamp((frame - 8) / 12, 0, 1);
  const glow = clamp((frame - 6) / 8, 0, 1) * 0.2;

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${baseDefs()}
      <g filter="url(#softShadow)">
        <g opacity="${F.opacity.toFixed(3)}" transform="translate(0 ${F.y})">
          <text class="mark" x="236" y="${STAGE.fcY + 148}" font-size="232" fill="#060606" stroke="#030303" stroke-width="20">F</text>
          <text class="mark" x="236" y="${STAGE.fcY + 136}" font-size="232" fill="url(#steel)" stroke="url(#edge)" stroke-width="3">F</text>
          <text class="mark" x="236" y="${STAGE.fcY + 136}" font-size="232" fill="url(#scratches)" opacity="0.95">F</text>
        </g>
        <g opacity="${C.opacity.toFixed(3)}" transform="translate(0 ${C.y})">
          <text class="mark" x="486" y="${STAGE.fcY + 148}" font-size="232" fill="#060606" stroke="#030303" stroke-width="20">C</text>
          <text class="mark" x="486" y="${STAGE.fcY + 136}" font-size="232" fill="url(#redSteel)" stroke="#ffeded" stroke-width="3">C</text>
          <text class="mark" x="486" y="${STAGE.fcY + 136}" font-size="232" fill="url(#scratches)" opacity="0.76">C</text>
        </g>
      </g>
      <g opacity="${glow.toFixed(3)}" filter="url(#glow)">
        <ellipse cx="600" cy="180" rx="220" ry="46" fill="#ff2a12"/>
      </g>
      <g opacity="${shine.toFixed(3)}">
        <rect x="${(-140 + shine * 840).toFixed(2)}" y="50" width="70" height="250" fill="#ffffff" opacity="0.12" transform="skewX(-20)"/>
      </g>
    </svg>
  `);
}

function forgedLayer(frame) {
  const drop = impactDrop(frame, 10, 8, -320, 14);
  const scale = 0.94 + easeOutExpo(reveal(frame, 10, 8)) * 0.06;
  const impact = clamp(1 - Math.abs(frame - 16) / 3.6, 0, 1);

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${baseDefs()}
      <g opacity="${drop.opacity.toFixed(3)}" transform="translate(600 ${drop.y + 24}) scale(${scale.toFixed(4)}) translate(-600 -24)">
        <g filter="url(#softShadow)">
          <text class="word" x="124" y="${STAGE.forgedY + 117}" font-size="154" fill="#060606" stroke="#030303" stroke-width="14">FORGED</text>
          <text class="word" x="124" y="${STAGE.forgedY + 106}" font-size="154" fill="url(#steel)" stroke="url(#edge)" stroke-width="2.5">FORGED</text>
          <text class="word" x="124" y="${STAGE.forgedY + 106}" font-size="154" fill="url(#scratches)" opacity="0.84">FORGED</text>
        </g>
      </g>
      <g opacity="${(impact * 0.34).toFixed(3)}" filter="url(#glow)">
        <ellipse cx="600" cy="354" rx="${(280 + impact * 160).toFixed(2)}" ry="${(20 + impact * 20).toFixed(2)}" fill="#ffffff"/>
      </g>
    </svg>
  `);
}

function customsLayer(frame) {
  const revealT = reveal(frame, 20, 8);
  const width = Math.round(736 * easeOutCubic(revealT));
  const opacity = clamp(revealT * 1.2, 0, 1);
  const lineProgress = reveal(frame, 19, 7);
  const lineLength = Math.round(130 * easeOutExpo(lineProgress));

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${baseDefs()}
      <g opacity="${opacity.toFixed(3)}">
        <text class="wide" x="274" y="${STAGE.customsY + 47}" font-size="54" fill="url(#redSteel)" stroke="#ff3030" stroke-width="1.2">CUSTOMS</text>
        <rect x="${274 + width}" y="${STAGE.customsY - 8}" width="${Math.max(0, 736 - width)}" height="70" fill="#000000"/>
      </g>
      <g opacity="${opacity.toFixed(3)}">
        <path d="M${235 - lineLength} ${STAGE.lineY}h${lineLength}" stroke="#c1121f" stroke-width="5"/>
        <path d="M965 ${STAGE.lineY}h${lineLength}" stroke="#c1121f" stroke-width="5"/>
      </g>
    </svg>
  `);
}

function taglineLayer(frame) {
  const t = reveal(frame, 28, 10);
  const opacity = clamp(t * 1.3, 0, 1);
  const offset = Math.round((1 - easeOutCubic(t)) * 34);

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${baseDefs()}
      <g opacity="${opacity.toFixed(3)}" transform="translate(0 ${offset})">
        <text class="tag" x="198" y="${STAGE.taglineY + 32}" font-size="28" fill="url(#steel)">BUILT DIFFERENT. FINISHED RIGHT.</text>
        <path d="M600 ${STAGE.taglineY + 46}l-24-28 24 13 24-13z" fill="#c1121f" stroke="#ff3030" stroke-width="1.5"/>
      </g>
    </svg>
  `);
}

function finalShine(frame) {
  const t = reveal(frame, 30, 10);
  const x = -260 + easeOutExpo(t) * 1460;
  const opacity = t > 0 ? 0.5 : 0;

  return svg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="${(opacity * 0.9).toFixed(3)}"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <filter id="shineBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10"/>
        </filter>
      </defs>
      <g opacity="${opacity.toFixed(3)}" transform="translate(${x.toFixed(2)} -40) skewX(-20)">
        <rect x="0" y="0" width="90" height="${HEIGHT + 120}" fill="url(#shine)" filter="url(#shineBlur)"/>
      </g>
    </svg>
  `);
}

async function buildFrame(frame, background) {
  const composites = [];

  if (background.buffer && background.meta) {
    const cropped = await sharp(background.buffer)
      .extract(backgroundCrop(background.meta, frame))
      .png()
      .toBuffer();
    composites.push({ input: cropped });
  }

  composites.push({ input: backdropOverlay(frame), blend: 'screen' });
  composites.push({ input: smokeOverlay(frame), blend: 'screen' });
  composites.push({ input: sparksOverlay(frame), blend: 'screen' });
  composites.push({ input: impactFlash(frame), blend: 'screen' });
  composites.push({ input: fcLayer(frame) });
  composites.push({ input: forgedLayer(frame) });
  composites.push({ input: customsLayer(frame) });
  composites.push({ input: taglineLayer(frame) });
  composites.push({ input: finalShine(frame), blend: 'screen' });

  return sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const background = await loadBackground();
  const frames = [];

  for (let frame = 0; frame < FRAMES; frame += 1) {
    frames.push(await buildFrame(frame, background));
  }

  await sharp(frames, { join: { animated: true } })
    .gif({
      colours: 128,
      effort: 10,
      dither: 0.92,
      interFrameMaxError: 8,
      interPaletteMaxError: 16,
      delay: Array.from({ length: FRAMES }, () => FRAME_DELAY),
      loop: 0
    })
    .toFile(OUTPUT_GIF);

  await sharp(frames[34]).png().toFile(OUTPUT_POSTER);

  console.log(JSON.stringify({
    outputGif: OUTPUT_GIF,
    outputPoster: OUTPUT_POSTER,
    backgroundPath: background.backgroundPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
