"use client";
export default function UploadBox({ onSelect, currentFileName }) {
  return (
    <div className="p-3 border-2 border-dashed rounded-lg w-72 text-center bg-white">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />
      <div className="text-sm mt-2">{currentFileName ?? "Upload PNG / JPG"}</div>
      <div className="text-xs text-slate-500 mt-1">Photo will be kept at its original pixel size</div>
    </div>
  );
}
