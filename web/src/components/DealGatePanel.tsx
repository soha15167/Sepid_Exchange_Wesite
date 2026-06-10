"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, MessageCircle, X } from "lucide-react";
import { apiFetch, type DealStatus } from "@/lib/api";

type Props = {
  offerId: number;
  deal: DealStatus;
  token: string | null;
  onChange: () => void;
  compact?: boolean;
};

export function DealGatePanel({ offerId, deal, token, onChange, compact }: Props) {
  const [accountText, setAccountText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!deal.gate?.active) return null;

  async function respond(response: "yes" | "no") {
    if (!token) return;
    if (response === "no" && !confirm("معامله رد شود؟")) return;
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`/api/deals/${offerId}/response`, {
        method: "POST",
        body: JSON.stringify({ response }),
      }, token);
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  async function submitAccount() {
    if (!token || accountText.trim().length < 2) return;
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`/api/deals/${offerId}/accounts`, {
        method: "POST",
        body: JSON.stringify({ text: accountText.trim() }),
      }, token);
      setAccountText("");
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  const g = deal.gate;

  return (
    <div className={`rounded-xl border border-brand-400/20 bg-brand-500/10 text-sm ${compact ? "mt-3 p-3" : "mt-4 p-4"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-brand-100">{g.status_label || g.status}</p>
        {!compact && (
          <Link href={`/dashboard/deals/${offerId}`} className="text-xs text-brand-200 underline">
            جزئیات معامله
          </Link>
        )}
      </div>

      <ul className="mt-2 space-y-1 text-white/70">
        <li>تأیید خریدار: {g.buyer_confirmed ? "✓" : "—"}</li>
        <li>تأیید فروشنده: {g.seller_confirmed ? "✓" : "—"}</li>
        <li>حساب خریدار: {g.buyer_account_sent ? "✓" : "—"}</li>
        <li>حساب فروشنده: {g.seller_account_sent ? "✓" : "—"}</li>
      </ul>

      {deal.can_respond && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => respond("yes")}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500/30 px-3 py-2 text-xs text-brand-100"
          >
            <Check className="h-3.5 w-3.5" />
            تأیید نهایی (بله)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => respond("no")}
            className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-200"
          >
            <X className="h-3.5 w-3.5" />
            رد
          </button>
        </div>
      )}

      {deal.can_submit_account && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-white/55">اطلاعات حساب بانکی را در یک پیام متنی بنویسید:</p>
          <textarea
            className="input-field min-h-[100px] text-sm"
            value={accountText}
            onChange={(e) => setAccountText(e.target.value)}
            placeholder="IBAN، نام صاحب حساب، بانک..."
          />
          <button
            type="button"
            disabled={busy || accountText.trim().length < 2}
            onClick={submitAccount}
            className="btn-primary w-full py-2 text-xs disabled:opacity-50"
          >
            ارسال حساب
          </button>
        </div>
      )}

      {err && <p className="mt-2 text-xs text-red-300">{err}</p>}

      {deal.telegram_required && !deal.can_respond && !deal.can_submit_account && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-brand-200">
          <MessageCircle className="h-4 w-4 shrink-0" />
          {deal.telegram_hint || "ادامه از ربات تلگرام"}
          {deal.bot_link && (
            <a href={deal.bot_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
              باز کردن ربات
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </p>
      )}
    </div>
  );
}
