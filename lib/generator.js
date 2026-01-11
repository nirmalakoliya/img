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

export async function generateVariations(file, options = {}) {

  // Frame randomization (ONLY plain & mixed)
  if (options.mode === "frame") {
    const realModes = ["frame-plain", "frame-mixed"];
    options.mode = realModes[Math.floor(Math.random() * realModes.length)];
  }

  const {
    mode = "frame-mixed",
    count = 200
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

  // ONLY allowed modes now
  const coreType = core === "plain" ? "plain" : "mixed";

  while (results.length < count) {
    const thickness = rnd(minT, maxT);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const c1 = getUniqueColor(usedColors);
    const c2 = getUniqueColor(usedColors);

    const styleId = `${mode}-${coreType}-${c1}-${c2}-${thickness}`;
    if (usedStyles.has(styleId)) continue;
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
      } else {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        ctx.strokeStyle = gradient;
      }

      ctx.strokeRect(
        thickness / 2,
        thickness / 2,
        canvas.width - thickness,
        canvas.height - thickness
      );
    } else {
      // NON-FRAME MODE = ONLY PLAIN / MIXED BACKGROUND
      canvas.width = w;
      canvas.height = h;

      if (coreType === "plain") {
        ctx.fillStyle = c1;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        ctx.fillStyle = gradient;
      }

      ctx.fillRect(0, 0, w, h);

      ctx.shadowBlur = 35;
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.drawImage(img, 0, 0, w, h);
    }

    results.push(canvas.toDataURL("image/png"));
  }

  return results;
}
