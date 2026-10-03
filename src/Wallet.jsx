import React, { useState, useEffect } from "react";
import { Send, Zap, Smartphone, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
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

function naira(kobo) {
  return `₦${(kobo / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function TxRow({ tx }) {
  const isCredit = tx.direction === "credit";
  const statusColor = tx.status === "success" ? C.good : tx.status === "failed" ? C.bad : C.warn;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      {isCredit ? <ArrowDownLeft size={22} color={C.good} /> : <ArrowUpRight size={22} color={C.warn} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 600, color: C.text }}>
          {tx.counterparty_name || tx.narration || tx.category.replace("_", " ")}
        </div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: statusColor, marginTop: 2 }}>
          {tx.status} · {new Date(tx.created_at).toLocaleDateString()}
        </div>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: isCredit ? C.good : C.text }}>
        {isCredit ? "+" : "-"}{naira(tx.amount_kobo)}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
      <div style={{ background: C.panel, width: "100%", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={22} color={C.muted} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

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

function SubmitButton({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "14px", borderRadius: 12, border: "none",
      background: disabled ? C.border : C.good, color: disabled ? C.muted : "#0e271f",
      fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", marginTop: 6
    }}>
      {children}
    </button>
  );
}

export default function Wallet({ profileId, email }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [topupAmount, setTopupAmount] = useState("");

  const [billType, setBillType] = useState("airtime");
  const [billReference, setBillReference] = useState("");
  const [billAmount, setBillAmount] = useState("");

  async function loadWallet() {
    const { data: w } = await supabase.from("wallets").select("*").eq("profile_id", profileId).maybeSingle();
    if (!w) {
      const { data: created } = await supabase
        .from("wallets")
        .insert({ profile_id: profileId })
        .select()
        .single();
      setWallet(created);
    } else {
      setWallet(w);
    }
    const { data: txs } = await supabase
      .from("transactions")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20);
    setTransactions(txs || []);
  }

  useEffect(() => { loadWallet(); }, [profileId]);

  async function handleTopup() {
    setError(null);
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      setError("Enter an amount to top up.");
      return;
    }
    setBusy(true);
    let data;
    try {
      const res = await fetch("/.netlify/functions/paystack-initialize-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          wallet_id: wallet.id,
          amount_kobo: Math.round(parseFloat(topupAmount) * 100),
          email,
        }),
      });
      data = await res.json();
    } catch (e) {
      setBusy(false);
      setError("Could not reach the server. Please try again.");
      return;
    }
    setBusy(false);
    if (data?.error) {
      setError(data.error);
      return;
    }
    window.location.href = data.authorization_url;
  }

  async function handleBillPay() {
    setError(null);
    if (!billReference || !billAmount) {
      setError("Fill in the reference and amount.");
      return;
    }
    setBusy(true);
    let data;
    try {
      const res = await fetch("/.netlify/functions/paystack-bill-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          wallet_id: wallet.id,
          biller_type: billType,
          customer_reference: billReference,
          amount_kobo: Math.round(parseFloat(billAmount) * 100),
        }),
      });
      data = await res.json();
    } catch (e) {
      setBusy(false);
      setError("Could not reach the server. Please try again.");
      return;
    }
    setBusy(false);
    if (data?.error) {
      setError(data.error);
      return;
    }
    setSuccess("Bill paid.");
    setModal(null);
    loadWallet();
  }

  if (!wallet) {
    return <div style={{ color: C.muted, fontFamily: "'IBM Plex Sans', sans-serif", textAlign: "center", padding: 20 }}>Loading wallet...</div>;
  }

  return (
    <div>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 20px", textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, marginBottom: 6 }}>Wallet balance</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: C.text }}>
          {naira(wallet.balance_kobo)}
        </div>
        {wallet.status === "pending_kyc" && (
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: C.warn, marginTop: 8 }}>
            Verification pending — sending and receiving money will unlock once approved.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <button onClick={() => setModal("topup")} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          padding: "16px 10px", borderRadius: 14, border: `1px solid ${C.border}`,
          background: C.panel, color: C.text, cursor: "pointer"
        }}>
          <Send size={22} color={C.good} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>Top up wallet</span>
        </button>
        <button onClick={() => setModal("bill")} disabled={wallet.balance_kobo === 0} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          padding: "16px 10px", borderRadius: 14, border: `1px solid ${C.border}`,
          background: C.panel, color: wallet.balance_kobo > 0 ? C.text : C.muted,
          cursor: wallet.balance_kobo > 0 ? "pointer" : "not-allowed"
        }}>
          <Zap size={22} color={C.warn} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>Pay a bill</span>
        </button>
      </div>

      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: C.muted, textAlign: "center", marginBottom: 18, padding: "0 8px" }}>
        Sending money to other accounts isn't available yet. You can top up your wallet and pay bills for now.
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Recent activity
        </div>
        {transactions.length === 0 && (
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, padding: "12px 0" }}>
            No transactions yet.
          </div>
        )}
        {transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>

      {modal === "topup" && (
        <Modal title="Top up wallet" onClose={() => setModal(null)}>
          <Field label="Amount (₦)" type="number" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} placeholder="0.00" />
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: C.muted, marginBottom: 10 }}>
            You'll be taken to a secure Paystack page to pay by card or bank transfer.
          </div>
          {error && <div style={{ color: C.bad, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <SubmitButton disabled={busy} onClick={handleTopup}>{busy ? "Redirecting..." : "Continue to pay"}</SubmitButton>
        </Modal>
      )}

      {modal === "bill" && (
        <Modal title="Pay a bill" onClose={() => setModal(null)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["airtime", "data", "electricity", "tv_subscription", "education", "insurance"].map(t => (
              <button key={t} onClick={() => setBillType(t)} style={{
                flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 12,
                border: `1px solid ${billType === t ? C.good : C.border}`,
                background: billType === t ? C.good : "transparent",
                color: billType === t ? "#0e271f" : C.muted,
                fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, cursor: "pointer"
              }}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
          <Field
            label={
              billType === "electricity" ? "Meter number" :
              billType === "tv_subscription" ? "Smart card number" :
              billType === "education" ? "Exam registration number" :
              billType === "insurance" ? "Vehicle registration number" :
              "Phone number"
            }
            value={billReference} onChange={e => setBillReference(e.target.value)} placeholder="Enter reference"
          />
          <Field label="Amount (₦)" type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" />
          {error && <div style={{ color: C.bad, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <SubmitButton disabled={busy} onClick={handleBillPay}>{busy ? "Paying..." : "Pay"}</SubmitButton>
        </Modal>
      )}

      {success && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.good, color: "#0e271f", padding: "10px 20px", borderRadius: 20, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>
          {success}
        </div>
      )}
    </div>
  );
}
