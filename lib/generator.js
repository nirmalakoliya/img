import tinycolor from "tinycolor2";

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function getUniqueColor(used) {
  let attempts = 0;
  while (attempts < 500) {
    const c = tinycolor({
      h: Math.random() * 360,
      s: 60 + Math.random() * 30,
      v: 60 + Math.random() * 30
    }).toHexString();

    if (!used.has(c)) {
      used.add(c);
      return c;
    }
    attempts++;
  }
  return tinycolor.random().toHexString();
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function drawLines(ctx, w, h, type, colorMode, c1, c2, usedColors) {
  const spacing = Math.max(8, Math.round(Math.min(w, h) * (0.03 + Math.random() * 0.05)));
  const lineWidth = Math.max(2, Math.round(Math.min(w, h) * (0.008 + Math.random() * 0.02)));

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "square";

  const pickColorForIndex = (i) => {
    if (colorMode === "single") return c1;
    if (colorMode === "alternate") return i % 2 === 0 ? c1 : c2;
    return getUniqueColor(usedColors);
  };

  if (type === "vertical") {
    let i = 0;
    for (let x = 0; x < w + spacing; x += spacing) {
      ctx.strokeStyle = pickColorForIndex(i);
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
      i++;
    }
  } else if (type === "horizontal") {
    let i = 0;
    for (let y = 0; y < h + spacing; y += spacing) {
      ctx.strokeStyle = pickColorForIndex(i);
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
      i++;
    }
  } else if (type === "grid") {
    let i = 0;
    for (let x = 0; x < w + spacing; x += spacing) {
      ctx.strokeStyle = pickColorForIndex(i);
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
      i++;
    }
    for (let y = 0; y < h + spacing; y += spacing) {
      ctx.strokeStyle = pickColorForIndex(i);
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
      i++;
    }
  } else if (type === "random") {
    const lines = Math.max(10, Math.round((w + h) / spacing));
    for (let i = 0; i < lines; i++) {
      const angle = Math.random() * Math.PI * 2;
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const len = Math.max(w, h) * (0.5 + Math.random() * 1.0);
      const x1 = cx - Math.cos(angle) * len;
      const y1 = cy - Math.sin(angle) * len;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      ctx.strokeStyle = pickColorForIndex(i);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

function createStripePattern(colorA, colorB, size = 40) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pctx = patternCanvas.getContext("2d");

  pctx.fillStyle = colorA;
  pctx.fillRect(0, 0, size, size);

  pctx.strokeStyle = colorB;
  pctx.lineWidth = Math.max(4, Math.round(size * 0.12));
  pctx.beginPath();
  pctx.moveTo(-size * 0.2, size * 0.8);
  pctx.lineTo(size * 1.2, -size * 0.2);
  pctx.stroke();

  return pctx.createPattern(patternCanvas, "repeat");
}

export async function generateVariations(file, options = {}) {

  // ⭐ FIX: if user selects "frame", convert to real frame modes
  if (options.mode === "frame") {
    const realModes = [
      "frame-plain",
      "frame-mixed",
      "frame-lines-vertical",
      "frame-lines-horizontal",
      "frame-lines-grid",
      "frame-lines-random"
    ];
    options.mode = realModes[Math.floor(Math.random() * realModes.length)];
  }

  const {
    mode = "frame-mixed",
    count = 200,
    forcedLineColorMode = null
  } = options;

  const img = await loadImage(file);
  const w = img.width;
  const h = img.height;

  const results = [];
  const usedColors = new Set();
  const usedStyles = new Set();

  const minT = Math.max(4, Math.round(Math.min(w, h) * 0.02));
  const maxT = Math.max(minT + 1, Math.round(Math.min(w, h) * 0.12));

  const isFrame = mode.startsWith("frame-");
  const core = isFrame ? mode.slice(6) : mode;

  let coreType = core;
  if (core === "lining" || core === "lines") coreType = "lines-vertical";

  const allowed = [
    "plain",
    "mixed",
    "lines-vertical",
    "lines-horizontal",
    "lines-grid",
    "lines-random"
  ];
  if (!allowed.includes(coreType)) {
    coreType = "mixed";
  }

  while (results.length < count) {
    const thickness = rnd(minT, maxT);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const c1 = getUniqueColor(usedColors);
    const c2 = getUniqueColor(usedColors);

    const colorModes = ["single", "alternate", "multi"];
    const colorMode = forcedLineColorMode || colorModes[Math.floor(Math.random() * colorModes.length)];

    const styleId = `${mode}-${coreType}-${colorMode}-${c1}-${c2}-${thickness}`;
    if (usedStyles.has(styleId)) {
      continue;
    }
    usedStyles.add(styleId);

    if (isFrame) {
      canvas.width = w + thickness * 2;
      canvas.height = h + thickness * 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, thickness, thickness, w, h);

      ctx.lineWidth = thickness;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(0,0,0,0.35)";

      if (coreType === "plain") {
        ctx.strokeStyle = c1;
      } else if (coreType === "mixed") {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        ctx.strokeStyle = gradient;
      } else if (coreType.startsWith("lines-")) {
        const stripeColorA = colorMode === "single" ? c1 : colorMode === "alternate" ? c1 : getUniqueColor(usedColors);
        const stripeColorB = colorMode === "alternate" ? c2 : getUniqueColor(usedColors);

        const pattern = createStripePattern(stripeColorA, stripeColorB, Math.max(24, thickness * 6));
        ctx.strokeStyle = pattern;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, c1);
        gradient.add.addColorStop(1, c2);
        ctx.strokeStyle = gradient;
      }

      ctx.strokeRect(
        thickness / 2,
        thickness / 2,
        canvas.width - thickness,
        canvas.height - thickness
      );
    }

    else {
      canvas.width = w;
      canvas.height = h;

      if (coreType === "plain") {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, w, h);
      } else if (coreType === "mixed") {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (coreType.startsWith("lines-")) {
        let linesType = "vertical";
        if (coreType === "lines-vertical") linesType = "vertical";
        else if (coreType === "lines-horizontal") linesType = "horizontal";
        else if (coreType === "lines-grid") linesType = "grid";
        else if (coreType === "lines-random") linesType = "random";

        drawLines(ctx, w, h, linesType, colorMode, c1, c2, usedColors);
      } else {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.shadowBlur = 35;
      ctx.shadowColor = "rgba(0,0,0,0.40)";
      ctx.drawImage(img, 0, 0, w, h);
    }

    results.push(canvas.toDataURL("image/png"));
  }

  return results;
}
