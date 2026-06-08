from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from config.settings import LIST_RECENT_LIMIT
from database.db import (
    count_euro_adverts,
    count_users,
    daily_stats_since_hours,
    is_bot_enabled,
    list_euro_adverts_page,
    list_users_page,
    log_admin_action,
    update_euro_advert_status,
)
from web_api.deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_: dict = Depends(require_admin)):
    stats = daily_stats_since_hours(24)
    return {
        "bot_enabled": is_bot_enabled(),
        "users_total": count_users(),
        "adverts_total": count_euro_adverts(),
        "last_24h": stats,
    }


@router.get("/users")
def admin_users(page: int = Query(0, ge=0), admin: dict = Depends(require_admin)):
    lim = LIST_RECENT_LIMIT
    off = page * lim
    total = count_users()
    rows = list_users_page(limit=lim, offset=off)
    pages = max(1, (total + lim - 1) // lim) if total else 1
    items = []
    for r in rows:
        items.append(
            {
                "telegram_id": r[0],
                "username": r[1],
                "display_name": r[2],
                "full_name": r[3],
                "last_name": r[4],
                "phone_number": r[5],
                "email": r[6],
                "address": r[7],
            }
        )
    log_admin_action(int(admin["telegram_id"]), "web_admin_users_list", f"page={page}")
    return {"items": items, "page": page, "pages": pages, "total": total}


@router.get("/adverts")
def admin_adverts(page: int = Query(0, ge=0), admin: dict = Depends(require_admin)):
    lim = LIST_RECENT_LIMIT
    off = page * lim
    total = count_euro_adverts()
    rows = list_euro_adverts_page(limit=lim, offset=off)
    pages = max(1, (total + lim - 1) // lim) if total else 1
    items = [
        {
            "id": r[0],
            "owner_name": r[1],
            "username": r[2],
            "euro_amount": r[3],
            "rate_toman": r[4],
            "operation": r[5],
        }
        for r in rows
    ]
    log_admin_action(int(admin["telegram_id"]), "web_admin_adverts_list", f"page={page}")
    return {"items": items, "page": page, "pages": pages, "total": total}


@router.patch("/adverts/{advert_id}/status")
def admin_set_advert_status(
    advert_id: int,
    status: str,
    admin: dict = Depends(require_admin),
):
    ok = update_euro_advert_status(advert_id, status)
    log_admin_action(
        int(admin["telegram_id"]),
        "web_admin_advert_status",
        f"id={advert_id} status={status}",
    )
    return {"ok": ok}
