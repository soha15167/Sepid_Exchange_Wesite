# Sepid Exchange — Web Companion

مکمل وب ربات تلگرام. **ربات دست نخورده** — فقط ستون/جدول جدید در DB.

## پورت‌ها

| سرویس | پورت | توضیح |
|--------|------|--------|
| Iran Panel | **8000** | قبلاً اشغال — استفاده نمی‌کنیم |
| Web API | **8100** | FastAPI |
| Web UI | **3100** | Next.js |

## نصب (سرور)

```bash
cd /root/telegram_bot_project2
source venv/bin/activate
pip install -r requirements-web.txt

# API
python3 scripts/run_web_api.py

# Frontend (ترمینال جدا)
cd web && npm install && npm run build && npm run start
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

از `.env.web.example` در `.env` اضافه کنید:

- `WEB_API_PORT=8100`
- `WEB_JWT_SECRET=...`
- `WEB_DEV_OTP_IN_RESPONSE=1` (تا SMTP/OTP dev)

## کاربران

1. **ربات قدیمی:** lookup → OTP → link-password
2. **فقط وب:** OTP → register-after-otp (telegram_id منفی)
3. **ورود:** login با موبایل/ایمیل + رمز

آگهی از وب → کانال → پیشنهاد از ربات (همان DB).

## SCP (فایل‌های این فیچر)

```text
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\config\settings.py" "root@49.13.132.230:/root/telegram_bot_project2/config/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\database\db.py" "root@49.13.132.230:/root/telegram_bot_project2/database/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\database\web_auth.py" "root@49.13.132.230:/root/telegram_bot_project2/database/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\services\advert_publish.py" "root@49.13.132.230:/root/telegram_bot_project2/services/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web_api" "root@49.13.132.230:/root/telegram_bot_project2/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\web" "root@49.13.132.230:/root/telegram_bot_project2/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\requirements-web.txt" "root@49.13.132.230:/root/telegram_bot_project2/"
scp "C:\Users\Sohei\Desktop\Desktop\telegram_bot_project2\scripts\run_web_api.py" "root@49.13.132.230:/root/telegram_bot_project2/scripts/"
```

بعد از deploy DB migration خودکار با `ensure_schema` (restart bot یا اولین start API).

**ربات را restart کنید** تا migration ستون‌های web اعمال شود — رفتار ربات تغییر نمی‌کند.
