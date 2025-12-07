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
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateVariations(file, options = {}) {
  const { mode = "frame", count = 200 } = options;

  const img = await loadImage(file);
  const w = img.width;
  const h = img.height;

  const results = [];
  const usedColors = new Set();
  const usedStyles = new Set();

  const minT = Math.round(Math.min(w, h) * 0.02);
  const maxT = Math.round(Math.min(w, h) * 0.12);

  while (results.length < count) {
    const thickness = rnd(minT, maxT);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const c1 = getUniqueColor(usedColors);
    const c2 = getUniqueColor(usedColors);

    if (mode === "frame") {
      canvas.width = w + thickness * 2;
      canvas.height = h + thickness * 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, thickness, thickness);

      const styleId = `frame-${c1}-${c2}`;
      if (usedStyles.has(styleId)) continue;
      usedStyles.add(styleId);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, c1);
      gradient.addColorStop(1, c2);

      ctx.lineWidth = thickness;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.strokeRect(
        thickness / 2,
        thickness / 2,
        canvas.width - thickness,
        canvas.height - thickness
      );
    } else {
      canvas.width = w;
      canvas.height = h;

      const styleId = `bg-${c1}-${c2}`;
      if (usedStyles.has(styleId)) continue;
      usedStyles.add(styleId);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.shadowBlur = 35;
      ctx.shadowColor = "rgba(0,0,0,0.40)";
      ctx.drawImage(img, 0, 0);
    }

    results.push(canvas.toDataURL("image/png"));
  }

  return results;
}
