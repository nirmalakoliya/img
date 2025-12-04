import tinycolor from "tinycolor2";

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function randColor() {
  return tinycolor({
    h: Math.floor(Math.random() * 360),
    s: 55 + Math.random() * 35,
    v: 60 + Math.random() * 30
  }).toHexString();
}


function getUniqueColor(seenColors) {
  for (let i = 0; i < 300; i++) {
    const c = randColor();
    if (!seenColors.has(c)) {
      seenColors.add(c);
      return c;
    }
  }
  return randColor();
}


function getMultiColorStripedPattern(ctx, thickness) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = thickness * 4;
  patternCanvas.height = thickness;

  const pctx = patternCanvas.getContext("2d");

  const c1 = randColor();
  const c2 = randColor();
  const c3 = randColor();
  const c4 = randColor();

  pctx.fillStyle = c1;
  pctx.fillRect(0, 0, thickness, thickness);

  pctx.fillStyle = c2;
  pctx.fillRect(thickness, 0, thickness, thickness);

  pctx.fillStyle = c3;
  pctx.fillRect(thickness * 2, 0, thickness, thickness);

  pctx.fillStyle = c4;
  pctx.fillRect(thickness * 3, 0, thickness, thickness);

  return ctx.createPattern(patternCanvas, "repeat");
}


function drawLinearGradient(ctx, w, h, c1, c2, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  const x = Math.cos(rad), y = Math.sin(rad);
  const gx1 = w * (0.5 - x / 2), gy1 = h * (0.5 - y / 2);
  const gx2 = w * (0.5 + x / 2), gy2 = h * (0.5 + y / 2);
  const g = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}


function drawStriped(ctx, w, h, c1, c2, stripeSize = 20, angle = 0) {
  ctx.save();
  ctx.translate(w/2, h/2);
  ctx.rotate(angle * Math.PI/180);
  ctx.translate(-w/2, -h/2);

  for (let x = -w; x < w * 2; x += stripeSize * 2) {
    ctx.fillStyle = c1;
    ctx.fillRect(x, -h, stripeSize, h*3);
    ctx.fillStyle = c2;
    ctx.fillRect(x + stripeSize, -h, stripeSize, h*3);
  }

  ctx.restore();
}


function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}


export async function generateVariations(file, options = {}) {
  const { mode = "frame", count = 100 } = options;
  const img = await loadImage(file);

  const photoW = img.width;
  const photoH = img.height;

  const results = [];
  const seen = new Set();       
  const usedColors = new Set();  

  const maxThickness = Math.max(1, Math.round(Math.min(photoW, photoH) * 0.12));
  const minThickness = Math.max(1, Math.round(Math.min(photoW, photoH) * 0.02));

  for (let i = 0; i < count; i++) {
    let attempt = 0;
    let dataUrl = null;

    while (attempt < 200) {
      attempt++;

      if (mode === "frame") {

        const thickness = rnd(minThickness, maxThickness);
        const outW = photoW + thickness * 2;
        const outH = photoH + thickness * 2;

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);

        ctx.drawImage(img, thickness, thickness);

        
        const frameStyle = rnd(1, 3); 

        let styleId = "";
        ctx.lineWidth = thickness;

        if (frameStyle === 1) {
  
          const c = getUniqueColor(usedColors);
          ctx.strokeStyle = c;
          styleId = `solid|${c}`;

        } else if (frameStyle === 2) {

          const c1 = getUniqueColor(usedColors);
          const c2 = getUniqueColor(usedColors);

          const grad = ctx.createLinearGradient(0, 0, outW, outH);
          grad.addColorStop(0, c1);
          grad.addColorStop(1, c2);

          ctx.strokeStyle = grad;
          styleId = `gradient|${c1}|${c2}`;

        } else {

          const pat = getMultiColorStripedPattern(ctx, Math.round(thickness / 2));
          ctx.strokeStyle = pat;
          styleId = `striped|${Math.random().toString(36).slice(2)}`;
        }

 
        if (seen.has(styleId)) continue;
        seen.add(styleId);

        ctx.strokeRect(thickness / 2, thickness / 2, outW - thickness, outH - thickness);
        dataUrl = canvas.toDataURL("image/png");
        break;

      } else {


        const outW = photoW;
        const outH = photoH;

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext("2d");

        const c1 = getUniqueColor(usedColors);
        const c2 = getUniqueColor(usedColors);
        const angle = rnd(0, 360);
        const type = rnd(1, 3);

        if (type === 1) drawLinearGradient(ctx, outW, outH, c1, c2, angle);
        if (type === 2) drawStriped(ctx, outW, outH, c1, c2, Math.round(outW*0.03), angle);
        if (type === 3) {
          drawLinearGradient(ctx, outW, outH, c1, c2, angle);
          const imageData = ctx.getImageData(0,0,outW,outH);
          const d = imageData.data;
          for (let p = 0; p < d.length; p += 4) {
            const n = (Math.random() - 0.5) * 6;
            d[p] += n; d[p+1] += n; d[p+2] += n;
          }
          ctx.putImageData(imageData, 0, 0);
        }

        ctx.drawImage(img, 0, 0);

        const key = `bg|${c1}|${c2}|${angle}|${type}`;
        if (seen.has(key)) continue;

        seen.add(key);
        dataUrl = canvas.toDataURL("image/png");
        break;
      }
    }

    results.push(dataUrl);
  }

  return results;
}
