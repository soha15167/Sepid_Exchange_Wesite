"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/", label: "خانه" },
  { href: "/adverts", label: "آگهی‌ها" },
  { href: "/dashboard", label: "داشبورد" },
  { href: "/admin", label: "ادمین", admin: true },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 end-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-brand-700/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Sepid Exchange</p>
              <p className="text-xs text-white/50">مکمل ربات تلگرام</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links
              .filter((l) => !l.admin || user?.is_admin)
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "rounded-xl px-4 py-2 text-sm transition",
                    pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {l.label}
                </Link>
              ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!loading && user ? (
              <>
                <span className="text-sm text-white/70">{user.display_name}</span>
                <button type="button" onClick={logout} className="btn-ghost py-2 text-xs">
                  خروج
                </button>
              </>
            ) : (
              <Link href="/auth" className="btn-primary py-2 text-xs">
                ورود / ثبت‌نام
              </Link>
            )}
          </div>

          <button
            type="button"
            className="btn-ghost p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="منو"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/5 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              {!loading && user ? (
                <button type="button" onClick={logout} className="btn-ghost">
                  خروج
                </button>
              ) : (
                <Link href="/auth" className="btn-primary" onClick={() => setOpen(false)}>
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12">{children}</main>

      <footer className="relative border-t border-white/5 py-8 text-center text-xs text-white/40">
        Sepid Exchange — وب + تلگرام · آگهی در کانال · پیشنهاد از هر دو پلتفرم
      </footer>
    </div>
  );
}
