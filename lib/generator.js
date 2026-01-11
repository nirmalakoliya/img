import tinycolor from "tinycolor2";

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// ⭐ ADD ONLY
const EMOJIS = ["🔥", "😍", "😎", "❤️", "✨", "💥", "⭐", "🎉"];

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
  // existing frame logic (unchanged)
  if (options.mode === "frame") {
    const realModes = [
      "frame-plain",
      "frame-mixed"
    ];
    options.mode = realModes[Math.floor(Math.random() * realModes.length)];
  }

  const {
    mode = "frame",
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
  const coreType = isFrame ? mode.slice(6) : mode;

  while (results.length < count) {
    const thickness = rnd(minT, maxT);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const c1 = getUniqueColor(usedColors);
    const c2 = getUniqueColor(usedColors);

    const styleId = `${mode}-${c1}-${c2}-${thickness}`;
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
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.strokeStyle = grad;
      }

      ctx.strokeRect(
        thickness / 2,
        thickness / 2,
        canvas.width - thickness,
        canvas.height - thickness
      );
    } else {
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
      }

      ctx.shadowBlur = 35;
      ctx.shadowColor = "rgba(0,0,0,0.40)";
      ctx.drawImage(img, 0, 0, w, h);
    }

    // ⭐ ADD ONLY — EMOJI OPTION
    if (mode === "emoji") {
      const emoji = EMOJIS[results.length % EMOJIS.length];
      const x = Math.random() * (w - 60) + 30;
      const y = Math.random() * (h - 60) + 30;
      const size = Math.round(Math.min(w, h) * 0.05);
      const angle = (Math.random() * 60 - 30) * Math.PI / 180;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, 0, 0);
      ctx.restore();
    }

    results.push(canvas.toDataURL("image/png"));
  }

  return results;
}
