import React, { useState } from "react";
import { Phone, Lock, User } from "lucide-react";
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

// Supabase needs an email under the hood. We turn the phone number into one
// so farmers never see or type an email themselves.
function phoneToEmail(phone) {
  const digitsOnly = phone.replace(/\D/g, "");
  return `${digitsOnly}@yieldline.ng`;
}

function pinToPassword(pin) {
  // Supabase requires 6+ characters; this pads a 4-digit PIN safely.
  return `pin-${pin}`;
}

const bigInput = {
  width: "100%",
  padding: "16px 16px 16px 46px",
  borderRadius: 12,
  border: `1.5px solid ${C.border}`,
  background: C.panel,
  color: C.text,
  fontSize: 18,
  fontFamily: "'IBM Plex Sans', sans-serif",
  outline: "none",
};

const bigButton = {
  width: "100%",
  padding: "16px",
  borderRadius: 12,
  border: "none",
  background: C.good,
  color: "#0e271f",
  fontSize: 17,
  fontWeight: 700,
  fontFamily: "'Space Grotesk', sans-serif",
  cursor: "pointer",
};

export default function Auth({ onSignedIn }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (phone.length < 7) { setError("Please enter your full phone number."); return; }
    if (pin.length < 4) { setError("Your PIN should be at least 4 numbers."); return; }

    setLoading(true);
    const email = phoneToEmail(phone);
    const password = pinToPassword(pin);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      // Create the farmer's profile row right after signup
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        name: name || "Farmer",
        phone,
      });
      if (profileError) { setError(profileError.message); setLoading(false); return; }

      // Give every new farmer a starter checklist
      const { data: newProfile } = await supabase.from("profiles").select("id").eq("user_id", data.user.id).single();
      if (newProfile) {
        await supabase.from("checklist_items").insert([
          { profile_id: newProfile.id, label: "Vaccinated your birds this month?", needs_photo: false },
          { profile_id: newProfile.id, label: "Counted how many birds died?", needs_photo: false },
          { profile_id: newProfile.id, label: "Kept your feed receipt?", needs_photo: false },
          { profile_id: newProfile.id, label: "Taken a photo of your birds?", needs_photo: true },
          { profile_id: newProfile.id, label: "Found a new buyer?", needs_photo: false },
        ]);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError("Phone number or PIN is not correct."); setLoading(false); return; }
    }
    setLoading(false);
    onSignedIn();
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=IBM+Plex+Sans:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #8FA79C; }
      `}</style>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: C.text }}>Yieldline</div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted, marginTop: 4 }}>
            {mode === "login" ? "Welcome back" : "Let's set up your account"}
          </div>
        </div>

        {mode === "signup" && (
          <div style={{ position: "relative", marginBottom: 14 }}>
            <User size={20} color={C.muted} style={{ position: "absolute", left: 14, top: 16 }} />
            <input style={bigInput} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}

        <div style={{ position: "relative", marginBottom: 14 }}>
          <Phone size={20} color={C.muted} style={{ position: "absolute", left: 14, top: 16 }} />
          <input style={bigInput} placeholder="Phone number" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <div style={{ position: "relative", marginBottom: 18 }}>
          <Lock size={20} color={C.muted} style={{ position: "absolute", left: 14, top: 16 }} />
          <input style={bigInput} placeholder="4-number PIN" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} />
        </div>

        {error && (
          <div style={{ color: C.warn, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, marginBottom: 14, textAlign: "center" }}>
            {error}
          </div>
        )}

        <button type="submit" style={bigButton} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: C.good, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, cursor: "pointer" }}>
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
