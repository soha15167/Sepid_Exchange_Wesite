"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    apiFetch<{ bot_enabled: boolean; users_total: number; adverts_total: number }>(
      "/api/admin/stats",
      {},
      token,
    )
      .then(setStats)
      .catch((e) => setErr(e.message));
  }, [user, token, loading, router]);

  if (loading) return <p className="text-white/50">...</p>;
  if (err) return <p className="text-red-300">{err}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">پنل ادمین</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-5">
          <p className="text-white/50">کاربران</p>
          <p className="mt-2 text-3xl font-bold">{stats?.users_total as number}</p>
        </div>
        <div className="glass p-5">
          <p className="text-white/50">آگهی‌ها</p>
          <p className="mt-2 text-3xl font-bold">{stats?.adverts_total as number}</p>
        </div>
        <div className="glass p-5">
          <p className="text-white/50">ربات</p>
          <p className="mt-2 text-xl font-bold">{stats?.bot_enabled ? "فعال" : "غیرفعال"}</p>
        </div>
      </div>
      <p className="text-sm text-white/40">
        دسترسی ادمین از همان ADMIN_IDS ربات — deal gate کامل در فاز بعد.
      </p>
    </div>
  );
}
