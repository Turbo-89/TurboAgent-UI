"use client";
import axios from "axios";

export default function CommandsPage() {
  async function run(endpoint, args = {}) {
    await axios.post("/api/agent/action", { endpoint, args });
  }

  return (
    <div className="p-6 space-y-4">
      <button className="btn" onClick={() => run("generate")}>Genereer Pagina's</button>
      <button className="btn" onClick={() => run("seo")}>SEO Analyse</button>
      <button className="btn" onClick={() => run("video")}>Promo Video</button>
      <button className="btn" onClick={() => run("deploy")}>Deploy</button>
    </div>
  );
}
