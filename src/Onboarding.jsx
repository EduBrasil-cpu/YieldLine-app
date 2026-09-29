import React, { useState } from "react";
import { Check, Phone, Plus, X, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "./supabaseClient";

const C = {
  bg: "#0e271f",
  panel: "#12352a",
  border: "#22503f",
  text: "#F2F7F4",
  muted: "#8FA79C",
  good: "#34D399",
  warn: "#E3B341",
  bad: "#E36658",
};

const STEPS = ["Consent", "Identity", "Financial evidence", "Trade references", "Review"];

function DocRow({ title, note, done, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${done ? C.good : C.border}`,
        background: done ? "#16412f" : C.panel, textAlign: "left", cursor: "pointer", marginBottom: 10,
      }}
    >
      <div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, color: C.text }}>{title}</div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted, marginTop: 2 }}>{note}</div>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${done ? C.good : C.border}`,
        background: done ? C.good : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {done && <Check size={16} color="#0e271f" />}
      </div>
    </button>
  );
}

export default function Onb
