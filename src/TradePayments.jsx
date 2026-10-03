import React, { useState, useEffect } from "react";
import { Send, Truck, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { supabase } from "./supabaseClient";
import { t } from "./translations";

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

export default function TradePayments({ profileId, language = "en" }) {
  const [wallet, setWallet] = useState(null);
  const [traders, setTraders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  async function loadData() {
    const { data: w } = await supabase.from("wallets").select("*").eq("profile_id", profileId).maybeSingle();
    setWallet(w);

    const { data: traderList } = await supabase
      .from("profiles")
      .select("id, name")
      .neq("id", profileId)
      .not("name", "is", null)
      .limit(50);
    setTraders(traderList || []);
    if (traderList && traderList.length > 0 && !recipientId) setRecipientId(traderList[0].id);

    const { data: tx } = await supabase
      .from("transactions")
      .select("*, recipient:counterparty_profile_id(name)")
      .eq("profile_id", profileId)
      .eq("category", "trader_payment")
      .order("created_at", { ascending: false })
      .limit(15);
    setPayments(tx || []);
  }

  useEffect(() => { loadData(); }, [profileId]);

  async function submitPayment(e) {
    e.preventDefault();
    setError(null);
    const amt =
