import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { t } from "./translations";

const C = {
  bg: "#0e271f",
  panel: "#12352a",
  border: "#22503f",
  text: "#F2F7F4",
  muted: "#8FA79C",
  good: "#34D399",
  bad: "#E36658",
};

function Field({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{label}</div>
      <input {...props} style={{
        width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
        background: C.bg, color: C.text, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15
      }} />
    </div>
  );
}

export default function ManualTradeEntry({ profileId, language = "en", onSaved }) {
  const [recordType, setRecordType] = useState("sale");
  const [vertical, setVertical] = useState("grain");
  const [inputCategory, setInputCategory] = useState("seed");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!label.trim() || !amount || parseFloat(amount) <= 0) {
      setError("Enter a description and an amount.");
      return;
    }
    setBusy(true);

    const { error: insertError } = await supabase.from("records").insert({
      profile_id: profileId,
      vertical,
      direction: recordType === "input_purchase" ? "out" : "in",
      record_type: recordType,
      input_category: recordType === "input_purchase" ? inputCategory : null,
      label: label.trim(),
      amount: parseFloat(amount),
      record_date: date,
      trusted: false,
    });

    setBusy(false);
    if (insertError) {
      setError("Could not save this record. Please try again.");
      return;
    }

    setSuccess(true);
    setLabel("");
    setAmount("");
    if (onSaved) onSaved();
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
        {t("log_a_trade", language)}
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted, marginBottom: 16 }}>
        {t("log_a_trade_sub", language)}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["sale", "input_purchase"].map(rt => (
          <button key={rt} onClick={() => setRecordType(rt)} style={{
            flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 13,
            border: `1px solid ${recordType === rt ? C.good : C.border}`,
            background: recordType === rt ? C.good : "transparent",
            color: recordType === rt ? "#0e271f" : C.muted,
            fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, cursor: "pointer"
          }}>
            {rt === "sale" ? t("i_sold_something", language) : t("i_bought_inputs", language)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["grain", "livestock"].map(v
