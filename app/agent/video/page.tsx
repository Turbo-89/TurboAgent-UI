"use client";
import { useState } from "react";
import axios from "axios";

export default function VideoPage() {
  const [service, setService] = useState("");
  const [region, setRegion] = useState("");
  const [file, setFile] = useState("");

  async function generate() {
    const r = await axios.post("/api/agent/action", {
      endpoint: "video",
      args: { service, region }
    });

    setFile(r.data.file);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Promo Video Generator</h1>

      <input className="input" placeholder="dienst" value={service} onChange={(e) => setService(e.target.value)} />
      <input className="input" placeholder="regio" value={region} onChange={(e) => setRegion(e.target.value)} />

      <button className="btn" onClick={generate}>Genereer</button>

      {file && (
        <video controls className="w-64 mt-4">
          <source src={file} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
