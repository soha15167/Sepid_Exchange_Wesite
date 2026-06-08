from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from telegram import Bot

from config.settings import BOT_TOKEN
from database.db import (
    get_euro_advert_by_rowid,
    insert_advert_offer,
    list_advert_offers_joined_for_advert,
    proposer_has_pending_offer_on_advert,
)
from web_api.deps import get_current_user
from web_api.schemas import OfferCreateRequest

logger = logging.getLogger(__name__)
router = APIRouter(tags=["offers"])


def _offer_dict(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "advert_id": row.get("advert_rowid"),
        "seq": row.get("seq_in_advert"),
        "rate_toman": row.get("rate_toman"),
        "description": row.get("description"),
        "status": row.get("status") or "pending",
        "proposed_euro_amount": row.get("proposed_euro_amount"),
        "created_at": row.get("created_at"),
    }


@router.get("/adverts/{advert_id}/offers")
def list_advert_offers(advert_id: int, user: dict = Depends(get_current_user)):
    adv = get_euro_advert_by_rowid(advert_id)
    if not adv:
        raise HTTPException(status_code=404, detail="آگهی یافت نشد.")
    uid = int(user["telegram_id"])
    if int(adv.get("user_id") or 0) != uid:
        raise HTTPException(status_code=403, detail="فقط صاحب آگهی.")
    rows = list_advert_offers_joined_for_advert(advert_id, limit=100)
    return {"items": [_offer_dict(r) for r in rows]}


@router.post("/adverts/{advert_id}/offers")
async def create_offer(
    advert_id: int,
    body: OfferCreateRequest,
    user: dict = Depends(get_current_user),
):
    adv = get_euro_advert_by_rowid(advert_id)
    if not adv:
        raise HTTPException(status_code=404, detail="آگهی یافت نشد.")
    uid = int(user["telegram_id"])
    if int(adv.get("user_id") or 0) == uid:
        raise HTTPException(status_code=400, detail="نمی‌توانید به آگهی خود پیشنهاد دهید.")

    if proposer_has_pending_offer_on_advert(advert_id, uid):
        raise HTTPException(status_code=409, detail="پیشنهاد pending دارید.")

    db_user = user
    alias = (db_user.get("display_name") or "").strip() or None
    inserted = insert_advert_offer(
        advert_id,
        uid,
        int(body.rate_toman),
        description=body.description,
        offer_alias_name=alias,
        proposer_account_country=body.proposer_account_country,
        proposed_euro_amount=body.proposed_euro_amount,
    )
    if not inserted:
        raise HTTPException(status_code=400, detail="پیشنهاد پذیرفته نشد (قوانین نرخ).")

    offer_id, seq = inserted

    owner_id = int(adv.get("user_id") or 0)
    if owner_id > 0 and BOT_TOKEN:
        try:
            bot = Bot(token=BOT_TOKEN)
            await bot.send_message(
                chat_id=owner_id,
                text=(
                    f"📨 پیشنهاد جدید روی آگهی #{advert_id}\n"
                    f"نرخ: {body.rate_toman:,} تومان\n"
                    f"پیشنهاد #{seq} — از ربات یا سایت بررسی کنید."
                ),
            )
        except Exception as exc:
            logger.warning("notify owner offer failed: %s", exc)

    from services.advert_publish import refresh_advert_on_channel

    await refresh_advert_on_channel(advert_id)
    return {"ok": True, "offer_id": offer_id, "seq": seq}
