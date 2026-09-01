import React, { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, X, Wheat, Bird, Syringe } from "lucide-react";
import { supabase } from "./supabaseClient";

const C = {
  bg: "#0e271f",
  panel: "#12352a",
  border: "#22503f",
  text: "#F2F7F4",
  muted: "#8FA79C",
  good: "#34D399",
  warn: "#E3B341",
};

const grainPresets = [
  { label: "Sold grain", direction: "in", icon: <Wheat size={22} /> },
  { label: "Bought grain", direction: "out", icon: <Wheat size={22} /> },
];

const livestockPresets = [
  { label: "Sold birds", direction: "in", icon: <Bird size={22} /> },
  { label: "Bought feed", direction: "out", icon: <Bird size={22} /> },
  { label: "Vaccinated birds", direction: "out", icon: <Syringe size={22} /> },
];

export default function AddRecord({ profileId, vertical, onClose, onSaved }) {
  const [step, setStep] = useState("what"); // "what" -> "amount"
  const [preset, setPreset] = useState(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const presets = vertical === "grain" ? grainPresets : livestockPresets;

  async function handleSave() {
    const numericAmount = Number(amount.replace(/,/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter how much money.");
      return;
    }
    setSaving(true);
    const { error: insertError } = await supabase.from("records").insert({
      profile_id: profileId,
      vertical,
      direction: preset.direction,
      label: preset.label,
      amount: numericAmount,
      record_date: new Date().toISOString().slice(0, 10),
      trusted: false,
    });
    setSaving(false);
    if (insertError) { setError("Something went wrong. Try again."); return; }
    onSaved();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: C.bg, zIndex: 50,
      display: "flex", flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=IBM+Plex+Sans:wght@400;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: C.text }}>
          Add what happened
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
          <X size={26} />
        </button>
      </div>

      <div style={{ flex: 1, padding: "0 20px", maxWidth: 420, margin: "0 auto", width: "100%" }}>

        {step === "what" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            {presets.map((p) => (
              <button key={p.label} onClick={() => { setPreset(p); setStep("amount"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "18px 20px",
                  borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.panel,
                  cursor: "pointer", textAlign: "left"
                }}>
                {p.direction === "in"
                  ? <ArrowUpCircle size={24} color={C.good} />
                  : <ArrowDownCircle size={24} color={C.warn} />}
                {p.icon}
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, fontWeight: 600, color: C.text }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "amount" && preset && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {preset.direction === "in"
                ? <ArrowUpCircle size={26} color={C.good} />
                : <ArrowDownCircle size={26} color={C.warn} />}
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>
                {preset.label}
              </span>
            </div>

            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted, marginBottom: 10 }}>
              How much money?
            </div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <span style={{ position: "absolute", left: 16, top: 16, fontSize: 22, color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>₦</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                style={{
                  width: "100%", padding: "14px 16px 14px 40px", borderRadius: 12,
                  border: `1.5px solid ${C.border}`, background: C.panel, color: C.text,
                  fontSize: 26, fontFamily: "'Space Grotesk', sans-serif", outline: "none"
                }}
              />
            </div>

            {error && (
              <div style={{ color: C.warn, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>
                {error}
              </div>
            )}

            <button onClick={handleSave} disabled={saving} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none",
              background: C.good, color: "#0e271f", fontSize: 17, fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", marginTop: 12
            }}>
              {saving ? "Saving..." : "Save"}
            </button>

            <button onClick={() => setStep("what")} style={{
              width: "100%", padding: "12px", background: "none", border: "none",
              color: C.muted, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, marginTop: 6, cursor: "pointer"
            }}>
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
