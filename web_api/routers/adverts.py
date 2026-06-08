from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from config.settings import CHANNEL_USERNAME, LIST_RECENT_LIMIT
from database.db import (
    count_euro_adverts_owned_by_user,
    delete_euro_advert_for_owner,
    get_db,
    get_euro_advert_by_rowid,
    get_user,
    list_euro_adverts_owned_by_user,
    update_euro_advert_field_for_owner,
    user_advert_has_active_offers,
)
from database.web_auth import list_public_euro_adverts
from services.advert_publish import (
    delete_advert_channel_message,
    publish_euro_advert_to_channel,
    refresh_advert_on_channel,
)
from web_api.deps import get_current_user, get_optional_user
from web_api.schemas import AdvertCreateRequest, AdvertUpdateRequest

router = APIRouter(prefix="/adverts", tags=["adverts"])

_INSTANT_MAP = {
    "have": "دارم",
    "dont_have": "ندارم",
    "unknown": "اطلاعی ندارم",
}


def _advert_dict(adv: dict, *, viewer_id: int | None = None) -> dict:
    rid = int(adv.get("rowid") or adv.get("advert_rowid") or 0)
    owner_id = int(adv.get("user_id") or 0)
    ch_mid = adv.get("channel_message_id")
    link = None
    if ch_mid:
        link = f"https://t.me/{CHANNEL_USERNAME}/{ch_mid}"
    locked = user_advert_has_active_offers(rid)
    return {
        "id": rid,
        "owner_id": owner_id,
        "owner_name": adv.get("owner_name") or adv.get("full_name"),
        "operation": adv.get("operation"),
        "euro_amount": adv.get("euro_amount"),
        "rate_toman": adv.get("rate_toman"),
        "description": adv.get("description"),
        "methods": (adv.get("methods") or "").split(", ") if isinstance(adv.get("methods"), str) else adv.get("methods"),
        "account_country": adv.get("account_country"),
        "instant_transfer": adv.get("instant_transfer"),
        "euro_exchange": int(adv.get("euro_exchange") or 0),
        "status": adv.get("status") or "فعال",
        "created_at": adv.get("created_at"),
        "channel_link": link,
        "locked": locked,
        "is_mine": viewer_id is not None and owner_id == viewer_id,
    }


@router.get("")
def list_adverts(
    page: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    user: dict | None = Depends(get_optional_user),
):
    viewer_id = int(user["telegram_id"]) if user else None
    off = page * limit
    rows, total = list_public_euro_adverts(limit=limit, offset=off)
    pages = max(1, (total + limit - 1) // limit) if total else 1
    return {
        "items": [_advert_dict(r, viewer_id=viewer_id) for r in rows],
        "page": page,
        "pages": pages,
        "total": total,
    }


@router.get("/mine")
def my_adverts(
    page: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    uid = int(user["telegram_id"])
    lim = LIST_RECENT_LIMIT
    off = page * lim
    total = count_euro_adverts_owned_by_user(uid)
    rows = list_euro_adverts_owned_by_user(uid, limit=lim, offset=off)
    pages = max(1, (total + lim - 1) // lim) if total else 1
    return {
        "items": [_advert_dict(r, viewer_id=uid) for r in rows],
        "page": page,
        "pages": pages,
        "total": total,
    }


@router.get("/{advert_id}")
def get_advert(advert_id: int, user: dict | None = Depends(get_optional_user)):
    adv = get_euro_advert_by_rowid(advert_id)
    if not adv:
        raise HTTPException(status_code=404, detail="آگهی یافت نشد.")
    viewer_id = int(user["telegram_id"]) if user else None
    return _advert_dict(adv, viewer_id=viewer_id)


@router.post("")
async def create_advert(body: AdvertCreateRequest, user: dict = Depends(get_current_user)):
    uid = int(user["telegram_id"])
    db_user = get_user(uid) or user
    display = (db_user.get("display_name") or "").strip()
    full_name = display or f"{db_user.get('full_name', '')} {db_user.get('last_name', '')}".strip()

    instant = body.instant_transfer
    if body.operation == "فروش" and instant:
        instant = _INSTANT_MAP.get(instant, instant)
    elif body.operation == "خرید":
        instant = None

    methods_csv = ", ".join(m.strip() for m in body.methods if m.strip())
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO euro_adverts (
                user_id, full_name, euro_amount, rate_toman, description, methods, operation,
                account_country, instant_transfer, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'فعال')
            """,
            (
                uid,
                full_name,
                int(body.euro_amount),
                int(body.rate_toman),
                body.description.strip(),
                methods_csv,
                body.operation,
                body.account_country.strip(),
                instant,
            ),
        )
        advert_id = int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])

    result = await publish_euro_advert_to_channel(advert_id)
    if not result.get("ok"):
        raise HTTPException(status_code=500, detail=result.get("error") or "انتشار ناموفق")

    adv = get_euro_advert_by_rowid(advert_id)
    return {"ok": True, "advert": _advert_dict(adv or {}, viewer_id=uid), "publish": result}


@router.patch("/{advert_id}")
async def update_advert(
    advert_id: int,
    body: AdvertUpdateRequest,
    user: dict = Depends(get_current_user),
):
    uid = int(user["telegram_id"])
    if user_advert_has_active_offers(advert_id):
        raise HTTPException(status_code=409, detail="پیشنهاد فعال — ویرایش مجاز نیست.")

    field_map = {
        "euro_amount": body.euro_amount,
        "rate_toman": body.rate_toman,
        "description": body.description.strip() if body.description else None,
        "account_country": body.account_country.strip() if body.account_country else None,
        "instant_transfer": body.instant_transfer,
    }
    if body.methods is not None:
        field_map["methods"] = ", ".join(m.strip() for m in body.methods if m.strip())

    for field, value in field_map.items():
        if value is None:
            continue
        ok = update_euro_advert_field_for_owner(advert_id, uid, field, str(value))
        if not ok:
            raise HTTPException(status_code=404, detail="آگهی یافت نشد یا ویرایش مجاز نیست.")

    await refresh_advert_on_channel(advert_id)
    adv = get_euro_advert_by_rowid(advert_id)
    return {"ok": True, "advert": _advert_dict(adv or {}, viewer_id=uid)}


@router.delete("/{advert_id}")
async def remove_advert(advert_id: int, user: dict = Depends(get_current_user)):
    uid = int(user["telegram_id"])
    ok, ch_mid, ch_cid = delete_euro_advert_for_owner(advert_id, uid)
    if not ok:
        raise HTTPException(status_code=409, detail="حذف ممکن نیست (پیشنهاد فعال یا آگهی نامعتبر).")
    await delete_advert_channel_message(ch_cid, ch_mid)
    return {"ok": True}
