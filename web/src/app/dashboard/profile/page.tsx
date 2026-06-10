"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { formatPhone, ltrCell, ltrPhone } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  if (loading || !user) return <p className="text-white/50">...</p>;

  return (
    <div className="mx-auto w-full min-w-0 max-w-xl space-y-6">
      <Link href="/dashboard" className="btn-ghost inline-flex gap-2 py-2 text-sm">
        <ArrowRight className="h-4 w-4" />
        داشبورد
      </Link>

      <div className="glass space-y-4 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold">👤 مشخصات کاربر</h1>
        <dl className="space-y-3 text-sm">
          <Row label="🆔 آیدی عددی" value={String(user.telegram_id)} ltr />
          <Row
            label="👨‍💼 نام"
            value={`${user.full_name || "—"} ${user.last_name || ""}`.trim()}
          />
          <Row label="🏷️ نام نمایشی در آگهی" value={user.display_name} />
          <Row label="📧 ایمیل" value={user.email || "—"} ltr />
          <Row label="📱 شماره" value={user.phone_number || "—"} ltr />
          <Row
            label="🔗 نوع حساب"
            value={
              user.has_telegram
                ? "متصل به تلگرام"
                : user.is_web_only
                  ? "فقط وب"
                  : "—"
            }
          />
          <Row label="✅ وضعیت" value={user.web_account_complete ? "ثبت‌نام شده" : "ناقص"} />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  const text = label.includes("شماره") ? formatPhone(value) : value;
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 pb-3 sm:flex-row sm:justify-between sm:gap-2">
      <dt className="text-white/50">{label}</dt>
      <dd className={ltr ? `min-w-0 break-anywhere font-medium text-white/90 ${label.includes("شماره") ? ltrPhone : ltrCell}` : "min-w-0 break-anywhere font-medium text-white/90"}>{text}</dd>
    </div>
  );
}
