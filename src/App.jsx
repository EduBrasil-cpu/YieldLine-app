import React, { useState, useEffect } from "react";
import {
  Wheat, Bird, Coins, ArrowUpCircle, ArrowDownCircle,
  CheckCircle2, Circle, ShieldCheck, Calendar, Star, Camera, Users, BadgeCheck, Wallet, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import AddRecord from "./AddRecord";
import { calculateGrainScore, calculateLivestockScore } from "./scoring";

/* ---------------- Colors ---------------- */
const C = {
  bg: "#0e271f",
  panel: "#12352a",
  border: "#22503f",
  text: "#F2F7F4",
  muted: "#8FA79C",
  good: "#34D399",
  warn: "#E3B341",
};

function ScoreCircle({ score }) {
  const pct = score / 900;
  const circumference = 2 * Math.PI * 58;
  const offset = circumference * (1 - pct);
  const word = score >= 800 ? "VERY GOOD" : score >= 650 ? "GOOD" : "GETTING BETTER";
  return (
    <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
      <svg width="160" height="160" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="58" fill="none" stroke={C.border} strokeWidth="14" />
        <circle
          cx="70" cy="70" r="58" fill="none"
          stroke={C.good} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Star size={28} color={C.good} fill={C.good} />
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginTop: 6, textAlign: "center", lineHeight: 1.2 }}>
          {word}
        </div>
      </div>
    </div>
  );
}

function BigToggle({ type, setType }) {
  const opts = [
    { id: "grain", label: "Grain", icon: <Wheat size={30} /> },
    { id: "livestock", label: "Birds", icon: <Bird size={30} /> },
  ];
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => setType(o.id)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: "16px 28px", borderRadius: 14, cursor: "pointer",
            background: type === o.id ? C.good : C.panel,
            color: type === o.id ? "#0e271f" : C.text,
            border: `2px solid ${type === o.id ? C.good : C.border}`,
          }}>
          {o.icon}
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700 }}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function MoneyCard({ inFlow, label, amount, icon }) {
  return (
    <div style={{
      flex: "1 1 140px", background: C.panel, border: `2px solid ${inFlow ? C.good : C.warn}`,
      borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8
    }}>
      {icon}
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: C.text }}>{amount}</div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, textAlign: "center" }}>{label}</div>
    </div>
  );
}

function RecordRow({ r }) {
  const isIn = r.direction === "in";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      {isIn
        ? <ArrowUpCircle size={26} color={C.good} />
        : <ArrowDownCircle size={26} color={C.warn} />}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, fontWeight: 600, color: C.text }}>{r.label}</span>
          {r.trusted && <BadgeCheck size={15} color={C.good} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <Calendar size={13} color={C.muted} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: C.muted }}>{r.record_date}</span>
        </div>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: isIn ? C.good : C.warn }}>
        ₦{Number(r.amount).toLocaleString()}
      </div>
    </div>
  );
}

function BorrowCard({ score }) {
  const pct = Math.min(score / 900, 1);
  const limit = Math.round((score / 900) * 3000000);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Wallet size={20} color={C.good} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>
          How much you can borrow
        </span>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: C.good, marginBottom: 8 }}>
        ₦{limit.toLocaleString()}
      </div>
      <div style={{ height: 10, background: C.border, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: C.good, borderRadius: 6 }} />
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted }}>
        Keep recording your sales to borrow more.
      </div>
    </div>
  );
}

function GroupCard({ members }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Users size={20} color={C.good} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>
          Your group
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {members.map((m, i) => (
          <div key={i} style={{
            width: 46, height: 46, borderRadius: "50%", background: C.border,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.text
          }}>
            {m.slice(0, 1)}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted, marginTop: 10 }}>
        You all help each other pay back on time.
      </div>
    </div>
  );
}

function ChecklistRow({ item, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 4px",
      borderBottom: `1px solid ${C.border}`, background: "none", border: "none", cursor: "pointer", textAlign: "left"
    }}>
      {item.done
        ? <CheckCircle2 size={28} color={C.good} />
        : <Circle size={28} color={C.muted} />}
      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, color: C.text, flex: 1 }}>{item.label}</span>
      {!item.done && item.needs_photo && <Camera size={22} color={C.warn} />}
    </button>
  );
}

export default function SimpleYieldline() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [type, setType] = useState("grain");
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const isGrain = type === "grain";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadData() {
    if (!session) return;
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).limit(1);
    const p = profiles?.[0];
    setProfile(p);

    if (p) {
      const { data: allRecs } = await supabase
        .from("records")
        .select("*")
        .eq("profile_id", p.id)
        .eq("vertical", type)
        .order("record_date", { ascending: false });

      setRecords((allRecs || []).slice(0, 5));

      const { data: checklistItems } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("profile_id", p.id);
      setItems(checklistItems || []);

      const { data: members } = await supabase
        .from("group_members")
        .select("*")
        .eq("profile_id", p.id);
      setGroup(members?.map(m => m.member_name) || []);

      const result = type === "grain"
        ? calculateGrainScore(allRecs || [])
        : calculateLivestockScore(allRecs || [], checklistItems || []);

      const scoreColumn = type === "grain" ? "score_grain" : "score_livestock";
      if (p[scoreColumn] !== result.total) {
        await supabase.from("profiles").update({ [scoreColumn]: result.total }).eq("id", p.id);
        setProfile({ ...p, [scoreColumn]: result.total });
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [type, session]);

  const toggleItem = async (id, currentDone) => {
    setItems(items.map(it => it.id === id ? { ...it, done: !currentDone } : it));
    await supabase.from("checklist_items").update({ done: !currentDone }).eq("id", id);
    loadData();
  };

  const score = profile ? (isGrain ? profile.score_grain : profile.score_livestock) : 0;
  const moneyIn = records.filter(r => r.direction === "in").reduce((sum, r) => sum + Number(r.amount), 0);
  const moneyOut = records.filter(r => r.direction === "out").reduce((sum, r) => sum + Number(r.amount), 0);

  if (checkingSession) {
    return <div style={{ background: C.bg, minHeight: "100vh" }} />;
  }

  if (!session) {
    return <Auth onSignedIn={() => {}} />;
  }

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: C.muted }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=IBM+Plex+Sans:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 18px" }}>

        <div style={{ textAlign: "center", marginBottom: 22, position: "relative" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: C.text }}>
            Welcome back
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted }}>
            {profile?.name || "Farmer"}
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{
            position: "absolute", top: 0, right: 0, background: "none", border: "none",
            color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
          }}>
            <LogOut size={18} />
          </button>
        </div>

        <ScoreCircle score={score} />

        <div style={{ height: 22 }} />

        <div style={{ textAlign: "center", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, marginBottom: 10 }}>
          What do you want to see?
        </div>
        <BigToggle type={type} setType={setType} />

        <div style={{ height: 22 }} />

        <div style={{ display: "flex", gap: 12 }}>
          <MoneyCard inFlow label="Money you got" amount={`₦${moneyIn.toLocaleString()}`} icon={<Coins size={26} color={C.good} />} />
          <MoneyCard label="Money you spent" amount={`₦${moneyOut.toLocaleString()}`} icon={<Coins size={26} color={C.warn} />} />
        </div>

        <div style={{ height: 22 }} />

        <BorrowCard score={score} />

        <div style={{ height: 22 }} />

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            What you did recently
          </div>
          {records.map((r) => <RecordRow key={r.id} r={r} />)}
        </div>

        <div style={{ height: 22 }} />

        <GroupCard members={group} />

        <div style={{ height: 22 }} />

        {!isGrain && (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <ShieldCheck size={20} color={C.good} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>
                Keep your birds healthy
              </span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.muted, marginBottom: 8 }}>
              Tap to mark done
            </div>
            {items.map((item) => <ChecklistRow key={item.id} item={item} onToggle={() => toggleItem(item.id, item.done)} />)}
          </div>
        )}

        <div style={{ height: 22 }} />

        <div style={{ textAlign: "center", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: C.muted, padding: "0 12px" }}>
          The more you record, the more money you can borrow.
        </div>
      </div>

      <button onClick={() => setShowAddRecord(true)} style={{
        position: "fixed", bottom: 24, right: 24, width: 60, height: 60, borderRadius: "50%",
        background: C.good, border: "none", color: "#0e271f", fontSize: 30, fontWeight: 700,
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif"
      }}>
        +
      </button>

      {showAddRecord && profile && (
        <AddRecord
          profileId={profile.id}
          vertical={type}
          onClose={() => setShowAddRecord(false)}
          onSaved={() => { setShowAddRecord(false); loadData(); }}
        />
      )}
    </div>
  );
}
