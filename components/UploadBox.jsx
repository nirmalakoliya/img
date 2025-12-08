"use client";

export default function UploadBox({ onSelect, currentFileName }) {
  return (
    <div className="p-4 w-72 rounded-xl glass text-center">
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelect(f);
          }}
          className="w-full cursor-pointer"
        />
      </label>

      <div className="text-sm mt-2 text-white font-semibold">
        {currentFileName ?? "Upload PNG / JPG"}
      </div>
    </div>
  );
}
