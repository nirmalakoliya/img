"use client";
import { useState } from "react";
import UploadBox from "../components/UploadBox";
import { generateVariations } from "../lib/generator";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Page() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [mode, setMode] = useState("frame");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleGenerate() {
    if (!file) return alert("Please upload a photo first.");
    setLoading(true);
    setProgress(0);
    setImages([]);

    const results = [];
    const all = await generateVariations(file, { mode, count: 100 });

    for (let i = 0; i < all.length; i++) {
      results.push(all[i]);
      if ((i + 1) % 5 === 0 || i === all.length - 1) {
        setImages([...results]);
        setProgress(Math.round(((i + 1) / all.length) * 100));
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    setLoading(false);
  }

  async function downloadZip() {
    if (!images.length) return;
    const zip = new JSZip();
    images.forEach((durl, i) => {
      const b64 = durl.split(",")[1];
      zip.file(`variation-${String(i + 1).padStart(3, "0")}.png`, b64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "variations.zip");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1C4F] via-[#0F2D74] to-[#0A1C4F] p-6">

 
      <div className="w-full max-w-[1600px] bg-white/20 backdrop-blur-2xl border border-white/30 
                    rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-10 md:p-14">

        <h1 className="text-4xl md:text-6xl font-bold text-center mb-12 tracking-wide text-white drop-shadow-lg">
          Image Variator — 100 Unique Outputs
        </h1>

      
        <div className="flex flex-col md:flex-row md:items-start gap-10 bg-white/20 backdrop-blur-xl
                        p-8 md:p-12 rounded-3xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">

          <UploadBox onSelect={setFile} currentFileName={file?.name} />

   
          <div className="flex flex-col gap-6 w-full md:w-96 text-white font-semibold">
            <label className="text-2xl">Mode</label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="border border-white/40 bg-white/30 text-white p-4 rounded-xl backdrop-blur-md 
                         focus:outline-none shadow-lg"
            >
              <option value="frame" className="text-black font-bold">Frame (keeps photo pixels)</option>
              <option value="bg" className="text-black font-bold">Background (keeps photo pixels)</option>
            </select>

      
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-purple-600/90 hover:bg-purple-700 transition text-white font-bold px-6 py-4 
                         rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.4)] disabled:opacity-50 backdrop-blur-md"
            >
              Generate 100
            </button>

            <button
              onClick={downloadZip}
              disabled={!images.length}
              className="bg-orange-600/90 hover:bg-orange-700 transition text-white font-bold px-6 py-4 
                         rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.4)] disabled:opacity-50 backdrop-blur-md"
            >
              Download ZIP
            </button>

            {loading && (
              <div className="text-lg text-white">Generating... {progress}%</div>
            )}
          </div>
        </div>

    
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-3 shadow-xl"
            >
              <img
                src={src}
                className="w-full h-auto rounded-xl shadow-lg"
                alt={`var-${idx}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
