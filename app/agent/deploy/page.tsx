"use client";
import axios from "axios";

export default function DeployPage() {
  async function deploy() {
    await axios.post("/api/agent/action", { endpoint: "deploy" });
  }

  return (
    <div className="p-6">
      <button className="btn bg-green-600" onClick={deploy}>
        Deploy naar GitHub
      </button>
    </div>
  );
}
