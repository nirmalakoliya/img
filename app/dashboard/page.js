"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadBox from "../../components/UploadBox";
import { generateVariations } from "../../lib/generator";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const ok = localStorage.getItem("isLoggedIn");
    if (!ok) router.push("/");
  }, [router]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [mode, setMode] = useState("frame");
  const [loading, setLoading] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState("");

  function handleSelect(file) {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    if (!file) return alert("Upload a photo first");

    setLoading(true);
    setGenerateProgress(0);
    setImages([]);

    const all = await generateVariations(file, { mode, count: 200 });

    for (let i = 0; i < all.length; i++) {
      setImages((p) => [...p, all[i]]);
      setGenerateProgress(Math.round(((i + 1) / all.length) * 100));
      await new Promise((r) => setTimeout(r, 10));
    }

    setLoading(false);
  }

  async function downloadZip() {
    if (!images.length) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);
      setDownloadMessage("Preparing files...");

      const zip = new JSZip();

      const total = images.length;
      for (let i = 0; i < total; i++) {
        const dataUrl = images[i];
        const b64 = dataUrl.split(",")[1];
        zip.file(`${i + 1}.png`, b64, { base64: true });

        const packPercent = Math.round(((i + 1) / total) * 30);
        setDownloadProgress(packPercent);
        setDownloadMessage(`Packing files: ${packPercent}%`);
        await new Promise((r) => setTimeout(r, 5));
      }

      setDownloadMessage("Creating ZIP archive...");
      const blob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (meta) => {
          const genPercent = Math.round(meta.percent);
          const mapped = Math.min(99, 30 + Math.round((genPercent / 100) * 69));
          setDownloadProgress(mapped);
          setDownloadMessage(`Creating ZIP: ${genPercent}%`);
        }
      );

      setDownloadMessage("Starting download...");
      setDownloadProgress(99);
      saveAs(blob, "images.zip");

      await new Promise((r) => setTimeout(r, 400));
      setDownloadProgress(100);
      setDownloadMessage("Download ready (100%)");
    } catch (err) {
      console.error("Download error:", err);
      setDownloadMessage("Error during download");
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setDownloadMessage("");
        setDownloadProgress(0);
      }, 1000);
    }
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
              <img
                src={preview}
                className="max-w-full max-h-full object-contain"
                alt="preview"
              />
            </div>
          )}

          <div className="flex flex-col gap-5 w-full md:w-96">
            <label className="text-2xl font-semibold">Select Mode ❤</label>

            {/* UPDATED SELECT (FIXED BACKGROUND COLOR & OPTIONS) */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="p-3 rounded-xl bg-[#222] text-white border border-white/20"
            >
              <option value="frame" className="bg-[#222] text-white">Frame</option>
              <option value="bg" className="bg-[#222] text-white">Background</option>

              {/* New modes (your generator.js handles these) */}
              <option value="plain" className="bg-[#222] text-white">Plain Background</option>
              <option value="mixed" className="bg-[#222] text-white">Mixed Background</option>
              <option value="lines-vertical" className="bg-[#222] text-white">Vertical Lines</option>
              <option value="lines-horizontal" className="bg-[#222] text-white">Horizontal Lines</option>
              <option value="lines-grid" className="bg-[#222] text-white">Grid Lines</option>
              <option value="lines-random" className="bg-[#222] text-white">Random Angle Lines</option>
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
              disabled={!images.length || downloading}
              className="py-4 bg-orange-600 rounded-xl shadow-xl hover:bg-orange-700 disabled:opacity-40 cursor-pointer"
            >
              Download ZIP
            </button>

            {loading && (
              <div className="text-lg text-white">
                Generating: {generateProgress}%
              </div>
            )}

            {downloading && (
              <div className="mt-2">
                <div className="text-lg text-green-400 font-bold">{downloadMessage}</div>

                <div className="w-full bg-white/10 rounded-full h-3 mt-2 overflow-hidden">
                  <div
                    style={{ width: `${downloadProgress}%` }}
                    className="h-3 rounded-full bg-green-400 transition-all duration-150"
                  />
                </div>

                <div className="text-sm text-white/80 mt-1">
                  {downloadProgress}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
          {images.map((src, i) => (
            <div key={i} className="p-3 rounded-2xl glass">
              <img src={src} className="rounded-xl" alt={`var-${i}`} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
