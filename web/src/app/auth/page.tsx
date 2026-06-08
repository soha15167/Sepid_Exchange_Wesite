"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Step = "login" | "otp" | "password" | "register" | "link";

export default function AuthPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [lookupStatus, setLookupStatus] = useState("");
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [reg, setReg] = useState({
    full_name: "",
    last_name: "",
    display_name: "",
    email: "",
    address: "",
    phone_number: "",
    password: "",
    accept_terms: false,
  });

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{
        status: string;
        profile?: Record<string, unknown>;
        message: string;
      }>("/api/auth/lookup", { method: "POST", body: JSON.stringify({ login }) });

      setLookupStatus(data.status);
      setProfile(data.profile || null);

      if (data.status === "existing_web_user") {
        setStep("password");
      } else if (data.status === "link_telegram_user") {
        await sendOtp("link");
        setStep("link");
      } else {
        await sendOtp("register");
        setStep("register");
      }
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(purpose: string) {
    const data = await apiFetch<{ challenge_id: string; dev_otp?: string }>(
      "/api/auth/otp/send",
      { method: "POST", body: JSON.stringify({ login, purpose }) },
    );
    setChallengeId(data.challenge_id);
    if (data.dev_otp) setDevOtp(data.dev_otp);
    setStep(purpose === "link" ? "link" : "register");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string; user: Parameters<typeof setSession>[1] }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ login, password }) },
      );
      setSession(data.access_token, data.user);
      router.push("/dashboard");
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string; user: Parameters<typeof setSession>[1] }>(
        "/api/auth/link-password",
        {
          method: "POST",
          body: JSON.stringify({ challenge_id: challengeId, otp_code: otp, password }),
        },
      );
      setSession(data.access_token, data.user);
      router.push("/dashboard");
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string; user: Parameters<typeof setSession>[1] }>(
        "/api/auth/register-after-otp",
        {
          method: "POST",
          body: JSON.stringify({
            challenge_id: challengeId,
            otp_code: otp,
            ...reg,
            phone_number: reg.phone_number || login,
          }),
        },
      );
      setSession(data.access_token, data.user);
      router.push("/dashboard");
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white">ورود / ثبت‌نام</h1>
        <p className="mt-2 text-sm text-white/50">شماره موبایل (+989...) یا ایمیل ثبت‌شده در ربات</p>

        {(step === "login" || step === "password") && (
          <form onSubmit={step === "login" ? handleLookup : handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="label-text">موبایل یا ایمیل</label>
              <input
                className="input-field"
                dir="ltr"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="+989121234567"
                required
              />
            </div>
            {step === "password" && (
              <div>
                <label className="label-text">رمز عبور</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "..." : step === "password" ? "ورود" : "ادامه"}
            </button>
          </form>
        )}

        {step === "link" && profile && (
          <form onSubmit={handleLink} className="mt-8 space-y-4">
            <div className="rounded-xl border border-brand-400/20 bg-brand-500/10 p-4 text-sm">
              <p className="font-semibold text-brand-100">حساب تلگرام شما</p>
              <p className="mt-2 text-white/70">{(profile.display_name as string) || "کاربر"}</p>
              <p className="text-white/50">{profile.phone_number as string}</p>
            </div>
            <div>
              <label className="label-text">کد OTP</label>
              <input className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              {devOtp && <p className="mt-1 text-xs text-amber-200">dev: {devOtp}</p>}
            </div>
            <div>
              <label className="label-text">رمز عبور جدید (وب)</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              فعال‌سازی حساب وب
            </button>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <div>
              <label className="label-text">کد OTP</label>
              <input className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              {devOtp && <p className="mt-1 text-xs text-amber-200">dev: {devOtp}</p>}
            </div>
            {[
              ["full_name", "نام"],
              ["last_name", "نام خانوادگی"],
              ["display_name", "نام نمایشی (یکتا)"],
              ["email", "ایمیل"],
              ["address", "آدرس"],
              ["phone_number", "موبایل (+989...)"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input
                  className="input-field"
                  dir={key.includes("phone") || key === "email" ? "ltr" : undefined}
                  value={(reg as Record<string, string | boolean>)[key] as string}
                  onChange={(e) => setReg({ ...reg, [key]: e.target.value })}
                  required={key !== "phone_number"}
                />
              </div>
            ))}
            <div>
              <label className="label-text">رمز عبور</label>
              <input
                type="password"
                className="input-field"
                value={reg.password}
                onChange={(e) => setReg({ ...reg, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={reg.accept_terms}
                onChange={(e) => setReg({ ...reg, accept_terms: e.target.checked })}
              />
              قوانین و مقررات را می‌پذیرم
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              تکمیل ثبت‌نام
            </button>
          </form>
        )}

        {lookupStatus && step === "login" && (
          <p className="mt-4 text-xs text-white/40">وضعیت: {lookupStatus}</p>
        )}
      </div>
    </div>
  );
}
