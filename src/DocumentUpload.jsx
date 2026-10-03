import React, { useState } from "react";
import { FileText, Image as ImageIcon, Upload } from "lucide-react";
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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentUpload({ profileId, language = "en", onRecordsAdded }) {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (mode === "text" && !text.trim()) {
      setError("Paste some text from a receipt, invoice, or bank statement first.");
      return;
    }
    if (mode === "photo" && !imageFile) {
      setError("Choose a photo first.");
      return;
    }

    setBusy(true);
    try {
      const body = { profile_id: profileId };
      if (mode === "text") {
        body.text = text;
      } else {
        body.image_base64 = await fileToBase64(imageFile);
        body.image_media_type = imageFile.type || "image/jpeg";
      }

      const res = await fetch("/.netlify/functions/parse-trade-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setText("");
        setImageFile(null);
        setImagePreview(null);
        if (onRecordsAdded) onRecordsAdded(data.records_created);
      }
    } catch (e) {
      setError("Could not reach the server. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
        {t("add_a_document", language)}
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted, marginBottom: 16 }}>
        {t("add_a_document_sub", language)}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMode("text")} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "10px 0", borderRadius: 10, border: `1px solid ${mode === "text" ? C.good : C.border}`,
          background: mode === "text" ? C.good : "transparent", color: mode === "text" ? "#0e271f" : C.muted,
          fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer"
        }}>
          <FileText size={16} /> Paste text
        </button>
        <button onClick={() => setMode("photo")} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "10px 0", borderRadius: 10, border: `1px solid ${mode === "photo" ? C.good : C.border}`,
          background: mode === "photo" ? C.good : "transparent", color: mode === "photo" ? "#0e271f" : C.muted,
          fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer"
        }}>
          <ImageIcon size={16} /> Take a photo
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste receipt, invoice, or bank statement text here..."
          rows={6}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14,
            resize: "vertical", marginBottom: 14
          }}
        />
      ) : (
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "24px 12px", borderRadius: 10, border: `1px dashed ${C.border}`,
            background: C.panel, cursor: "pointer"
          }}>
            <Upload size={22} color={C.muted} />
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted }}>
              {imageFile ? imageFile.name : "Tap to choose or take a photo"}
            </span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{ display: "none" }} />
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ width: "100%", borderRadius: 10, marginTop: 10, maxHeight: 200, objectFit: "contain" }} />
          )}
        </div>
      )}

      {error && <div style={{ color: C.bad, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={busy} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none",
        background: busy ? C.border : C.good, color: busy ? C.muted : "#0e271f",
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
        cursor: busy ? "not-allowed" : "pointer"
      }}>
        {busy ? "Reading document..." : "Extract trade data"}
      </button>

      {result && (
        <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.panel }}>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: C.good, marginBottom: 6 }}>
            {result.records_created} record{result.records_created !== 1 ? "s" : ""} added
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
            {result.narrative}
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: C.muted, marginTop: 8 }}>
            New records are unverified until confirmed, they'll count toward your score once reviewed.
          </div>
        </div>
      )}
    </div>
  );
}
