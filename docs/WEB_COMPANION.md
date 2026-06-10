# Sepid Exchange — Web Companion

مکمل وب ربات تلگرام. **ربات دست نخورده** — فقط ستون/جدول جدید در DB.

## پورت‌ها

| سرویس | پورت | توضیح |
|--------|------|--------|
| Iran Panel | **8000** | قبلاً اشغال — استفاده نمی‌کنیم |
| Web API | **8100** | FastAPI |
| Web UI | **3100** | Next.js |

## ساختار پیشنهادی روی سرور

| مسیر | محتوا |
|------|--------|
| `/root/telegram_bot_project2` | ربات + **API** + دیتابیس + `.env` |
| `/root/web` | فقط **فرانت Next.js** (UI) |

API باید کنار ربات بماند چون همان DB، `.env` و ماژول‌های `database/` / `handlers/` را import می‌کند.  
فرانت را جدا در `/root/web` نگه داشتن deploy و restart UI را ساده‌تر می‌کند.

## نصب (سرور)

```bash
# --- API (کنار ربات) ---
cd /root/telegram_bot_project2
source venv/bin/activate
pip install -r requirements-web.txt
python3 scripts/run_web_api.py

# --- UI (مسیر جدا) ---
cd /root/web
npm install && npm run build && npm run start
```

اولین بار، پوشهٔ `web/` را روی سرور بسازید:

```bash
mkdir -p /root/web
# سپس محتوای web/ پروژه را با scp یا rsync کپی کنید
```

## محلی (ویندوز)

```powershell
pip install -r requirements-web.txt
python scripts/run_web_api.py

cd web
npm install
npm run dev
```

- API: http://127.0.0.1:8100/api/health
- UI: http://127.0.0.1:3100

## env

در `/root/telegram_bot_project2/.env` (ربات + API):

- `WEB_API_PORT=8100`
- `WEB_JWT_SECRET=...`
- `WEB_DEV_OTP_IN_RESPONSE=1` (تا SMTP/OTP dev)
- `WEB_FRONTEND_URL=http://49.13.132.230:3100`

در `/root/web/.env.local` (اختیاری — فقط UI):

- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8100`

## کاربران

1. **ربات قدیمی:** lookup → OTP → link-password
2. **فقط وب:** OTP → register-after-otp (telegram_id منفی)
3. **ورود:** login با موبایل/ایمیل + رمز

آگهی از وب → کانال → پیشنهاد از ربات (همان DB).

## SCP (فایل‌های این فیچر)

**API و لایهٔ مشترک → `/root/telegram_bot_project2/`**

```text
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\config\settings.py" "root@49.13.132.230:/root/telegram_bot_project2/config/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\database\db.py" "root@49.13.132.230:/root/telegram_bot_project2/database/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\database\web_auth.py" "root@49.13.132.230:/root/telegram_bot_project2/database/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\services\advert_publish.py" "root@49.13.132.230:/root/telegram_bot_project2/services/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web_api\main.py" "root@49.13.132.230:/root/telegram_bot_project2/web_api/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\requirements-web.txt" "root@49.13.132.230:/root/telegram_bot_project2/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\scripts\run_web_api.py" "root@49.13.132.230:/root/telegram_bot_project2/scripts/"
```

**فرانت UI → `/root/web/`**

```text
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\package.json" "root@49.13.132.230:/root/web/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\package-lock.json" "root@49.13.132.230:/root/web/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\next.config.mjs" "root@49.13.132.230:/root/web/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\tsconfig.json" "root@49.13.132.230:/root/web/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\tailwind.config.ts" "root@49.13.132.230:/root/web/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\postcss.config.mjs" "root@49.13.132.230:/root/web/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web\src\app\page.tsx" "root@49.13.132.230:/root/web/src/app/"
```

برای کل پوشهٔ `web/` یک‌جا: `scp -r web/* root@49.13.132.230:/root/web/`

بعد از deploy DB migration خودکار با `ensure_schema` (restart bot یا اولین start API).

**ربات را restart کنید** تا migration ستون‌های web اعمال شود — رفتار ربات تغییر نمی‌کند.
