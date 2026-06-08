"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Smartphone, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-xs text-brand-200">
            <Zap className="h-3.5 w-3.5" />
            نسخه وب — هماهنگ با ربات
          </span>
          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            صرافی یورو
            <span className="block bg-gradient-to-l from-brand-300 to-brand-500 bg-clip-text text-transparent">
              ساده، سریع، یکپارچه
            </span>
          </h1>
          <p className="max-w-xl text-base leading-8 text-white/60">
            آگهی بگذارید از سایت، پیشنهاد بدهید از ربات — یا برعکس. همان دیتابیس، همان
            کانال، همان منطق معامله.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/adverts" className="btn-primary">
              مشاهده آگهی‌ها
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/auth" className="btn-ghost">
              ورود / ثبت‌نام
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass relative overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
          <div className="relative grid gap-4 sm:grid-cols-2">
            {[
              { icon: Smartphone, title: "موبایل و دسکتاپ", desc: "طراحی واکنش‌گرا" },
              { icon: Shield, title: "OTP + رمز", desc: "اتصال حساب تلگرام" },
              { icon: Zap, title: "انتشار فوری", desc: "آگهی در کانال تلگرام" },
              { icon: ArrowLeft, title: "تعامل دوطرفه", desc: "سایت ↔ ربات" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
                <item.icon className="mb-3 h-5 w-5 text-brand-400" />
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
