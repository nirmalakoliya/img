"use client";

import { useState } from "react";
import UploadBox from "../../components/UploadBox";
import { generateVariations } from "../../lib/generator";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [mode, setMode] = useState("frame");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleSelect(file) {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    if (!file) return alert("Upload a photo first");

    setLoading(true);
    setProgress(0);
    setImages([]);

    const all = await generateVariations(file, { mode, count: 200 });

    for (let i = 0; i < all.length; i++) {
      setImages((p) => [...p, all[i]]);
      setProgress(Math.round(((i + 1) / all.length) * 100));
      await new Promise((r) => setTimeout(r, 10));
    }

    setLoading(false);
  }

  async function downloadZip() {
    const zip = new JSZip();

    images.forEach((durl, i) => {
      const b64 = durl.split(",")[1];
      zip.file(`${i + 1}.png`, b64, { base64: true });
    });

    const blob = await zip.generateAsync(
      { type: "blob" },
      (meta) => setProgress(Math.floor(meta.percent))
    );

    saveAs(blob, "images.zip");
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-10 text-white">
      <div className="w-full max-w-[1600px]">

        <h1 className="text-5xl font-bold text-center mb-12 drop-shadow-lg">
          Image Variator — 200 Unique Outputs
        </h1>

        <div className="glass p-12 rounded-3xl flex flex-col md:flex-row gap-12 justify-center items-center">

         
          <UploadBox onSelect={handleSelect} currentFileName={file?.name} />

         
          {preview && (
            <div className="w-80 h-80 rounded-xl glass overflow-hidden flex justify-center items-center">
              <img src={preview} className="max-w-full max-h-full object-contain" />
            </div>
          )}

    
          <div className="flex flex-col gap-5 w-full md:w-96">

            <label className="text-2xl font-semibold">Select Mode ❤</label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="p-3 rounded-xl glass text-white"
            >
              <option value="frame" className="text-black">Frame</option>
              <option value="bg" className="text-black">Background</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="py-4 bg-blue-600 rounded-xl shadow-xl hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
            >
              Generate 200
            </button>

            <button
              onClick={downloadZip}
              disabled={!images.length}
              className="py-4 bg-orange-600 rounded-xl shadow-xl hover:bg-orange-700 disabled:opacity-40 cursor-pointer"
            >
              Download ZIP
            </button>

            {loading && (
              <div className="text-lg text-white">Progress: {progress}%</div>
            )}

          </div>
        </div>

     
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
          {images.map((src, i) => (
            <div key={i} className="p-3 rounded-2xl glass">
              <img src={src} className="rounded-xl" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
