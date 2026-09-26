import React, { useState, useEffect } from "react";
import {
  Wheat, Bird, Coins, ArrowUpCircle, ArrowDownCircle,
  CheckCircle2, Circle, ShieldCheck, Calendar, Star, Camera, Users, BadgeCheck, Wallet, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Onboarding from "./Onboarding";
import WalletScreen from "./Wallet";
import DocumentUpload from "./DocumentUpload";
import ManualTradeEntry from "./ManualTradeEntry";
import { t } from "./translations";
import TradePayments from "./TradePayments";

const C = {
  bg: "#0e271f",
  panel: "#12352a",
  border: "#22503f",
  text: "#F2F7F4",
  muted: "#8FA79C",
  good: "#34D399",
  warn: "#E3B341",
};

const SCORE_MAX = 850;
const SCORE_MIN = 300;

function ScoreCircle({ score }) {
  const pct = Math.max(0, Math.min((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN), 1));
  const circumference = 2 * Math.PI * 58;
  const offset = circumference * (1 - pct);
  const word = score >= 720 ? "VERY GOOD" : score >= 550 ? "GOOD" : "GETTING BETTER";
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
  const pct = Math.max(0, Math.min((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN), 1));
  const limit = Math.round(pct * 3000000);
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
  const [tab, setTab] = useState("dashboard");
  const [type, setType] = useState("grain");
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!session) return;
    async function load() {
      setLoading(true);
      const { data: profiles } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).limit(1);
      const p = profiles?.[0];
      setProfile(p);
      if (p) {
        const { data: recs } = await supabase
          .from("records")
          .select("*")
          .eq("profile_id", p.id)
          .eq("vertical", type)
          .order("record_date", { ascending: false })
          .limit(5);
        setRecords(recs || []);

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
      }
      setLoading(false);
    }
    load();
  }, [type, session]);

  const toggleItem = async (id, currentDone) => {
    setItems(items.map(it => it.id === id ? { ...it, done: !currentDone } : it));
    await supabase.from("checklist_items").update({ done: !currentDone }).eq("id", id);
  };

  const score = profile ? profile.score_total : SCORE_MIN;
  const moneyIn = records.filter(r => r.direction === "in").reduce((sum, r) => sum + Number(r.amount), 0);
  const moneyOut = records.filter(r => r.direction === "out").reduce((sum, r) => sum + Number(r.amount), 0);

  if (checkingSession) {
    return <div style={{ background: C.bg, minHeight: "100vh" }} />;
  }

  if (!session) {
    return <Auth onSignedIn={() => {}} />;
  }

  if (!loading && profile && !profile.consent_status) {
    return (
      <Onboarding
        profile={profile}
        onComplete={() => window.location.reload()}
      />
    );
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

        <div style={{ display: "flex", gap: 8, marginBottom: 8, background: C.panel, borderRadius: 12, padding: 4 }}>
          {["dashboard", "wallet", "pay", "documents"].map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
              background: tab === tabKey ? C.good : "transparent",
              color: tab === tabKey ? "#0e271f" : C.muted,
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, fontWeight: 700,
              cursor: "pointer", textTransform: "capitalize"
            }}>
              {t(tabKey, profile.language)}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          {["en", "pcm"].map(lang => (
            <button key={lang} onClick={async () => {
              await supabase.from("profiles").update({ language: lang }).eq("id", profile.id);
              setProfile(p => ({ ...p, language: lang }));
            }} style={{
              padding: "4px 10px", fontSize: 11, borderRadius: 6, marginLeft: 6,
              border: `1px solid ${profile.language === lang ? C.good : C.border}`,
              background: profile.language === lang ? C.good : "transparent",
              color: profile.language === lang ? "#0e271f" : C.muted,
              fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, cursor: "pointer"
            }}>
              {lang === "en" ? "English" : "Pidgin"}
            </button>
          ))}
        </div>

        {tab === "wallet" ? (
          <WalletScreen profileId={profile.id} email={session.user.email} language={profile.language} />
        ) : tab === "pay" ? (
          <TradePayments profileId={profile.id} language={profile.language} />
        ) : tab === "documents" ? (
          <>
            <ManualTradeEntry profileId={profile.id} language={profile.language} />
            <div style={{ height: 20 }} />
            <DocumentUpload profileId={profile.id} language={profile.language} />
          </>
        ) : (
        <>
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
          {t("encouragement", profile.language)}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
