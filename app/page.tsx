"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConstraintSet } from "../lib/data/schema";

const STORAGE_KEY = "embedkit:constraints";

const EXAMPLE_PROMPTS = [
  "A wireless temperature sensor that lasts 6 months on a battery",
  "GPS tracker with encrypted LoRa comms, coin cell powered",
  "BLE heart rate monitor, rechargeable, under $15 BOM",
];

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Parse failed");
      }

      const constraints = data.constraints as ConstraintSet;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(constraints));
      router.push("/configure");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  return (
    <main
      style={{ backgroundColor: "#0f1117", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-4"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", fontSize: "22px" }}
          className="font-bold tracking-tight mb-1"
        >
          EmbedKit
        </h1>
        <p style={{ color: "#6b7099", fontSize: "13px", fontFamily: "Inter, system-ui, sans-serif" }}>
          Design embedded systems the way engineers think.
        </p>
      </div>

      {/* Input panel */}
      <div
        style={{
          backgroundColor: "#1a1d27",
          border: "1px solid #2a2d3a",
          borderRadius: "6px",
          padding: "20px",
          width: "100%",
          maxWidth: "640px",
        }}
      >
        <label
          htmlFor="intent-input"
          style={{ color: "#6b7099", fontSize: "11px", fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "0.08em" }}
          className="block mb-2 uppercase"
        >
          Describe your project
        </label>

        <textarea
          id="intent-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={EXAMPLE_PROMPTS[0]}
          rows={3}
          style={{
            width: "100%",
            backgroundColor: "#0f1117",
            border: "1px solid #2a2d3a",
            borderRadius: "4px",
            color: "#e2e4f0",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            padding: "12px",
            resize: "vertical",
            outline: "none",
          }}
        />

        {error && (
          <p style={{ color: "#f87171", fontSize: "12px", fontFamily: "Inter, system-ui, sans-serif", marginTop: "8px" }}>
            ⚠ {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span style={{ color: "#6b7099", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "extracting constraints…" : "Ctrl+Enter to submit"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || input.trim().length === 0}
            style={{
              backgroundColor: loading ? "#2a2d3a" : "#60a5fa",
              color: loading ? "#6b7099" : "#0f1117",
              border: "none",
              borderRadius: "4px",
              padding: "8px 20px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "…" : "Configure →"}
          </button>
        </div>
      </div>

      {/* Example prompts */}
      <div className="mt-6" style={{ width: "100%", maxWidth: "640px" }}>
        <p style={{ color: "#6b7099", fontSize: "11px", fontFamily: "Inter, system-ui, sans-serif", marginBottom: "8px" }}>
          Try an example:
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #2a2d3a",
                borderRadius: "4px",
                color: "#6b7099",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                padding: "6px 12px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
