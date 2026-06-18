"use client";

import { useRef } from "react";

export default function FileUpload({
  onUploaded = () => {},
}: {
  onUploaded?: (info: any) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      onUploaded({ filename: file.name, url: null, error: true });
      return;
    }

    const json = await res.json();
    onUploaded(json);
  }

  return (
    <>
      <button
        className="p-2 bg-neutral-700 text-white rounded"
        onClick={() => fileRef.current?.click()}
        type="button"
      >
        📎
      </button>

      <input
        type="file"
        ref={fileRef}
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}
