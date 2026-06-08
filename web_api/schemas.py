from __future__ import annotations

from pydantic import BaseModel, Field


class LookupRequest(BaseModel):
    login: str = Field(..., min_length=3, description="Phone (+989...) or email")


class OtpSendRequest(BaseModel):
    login: str
    purpose: str = "login"


class OtpVerifyRequest(BaseModel):
    challenge_id: str
    code: str = Field(..., min_length=4, max_length=8)


class PasswordSetRequest(BaseModel):
    challenge_id: str
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    login: str
    password: str


class RegisterRequest(BaseModel):
    challenge_id: str
    full_name: str = Field(..., min_length=2, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    display_name: str = Field(..., min_length=2, max_length=40)
    email: str
    address: str = Field(..., min_length=3, max_length=300)
    phone_number: str
    password: str = Field(..., min_length=6, max_length=128)
    accept_terms: bool = False


class AdvertCreateRequest(BaseModel):
    operation: str = Field(..., pattern="^(خرید|فروش)$")
    euro_amount: int = Field(..., gt=0)
    rate_toman: int = Field(..., gt=0)
    description: str = Field(..., min_length=3, max_length=2000)
    methods: list[str] = Field(..., min_length=1)
    account_country: str = Field(..., min_length=2, max_length=80)
    instant_transfer: str | None = None


class AdvertUpdateRequest(BaseModel):
    euro_amount: int | None = Field(default=None, gt=0)
    rate_toman: int | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, min_length=3, max_length=2000)
    methods: list[str] | None = None
    account_country: str | None = Field(default=None, min_length=2, max_length=80)
    instant_transfer: str | None = None


class OfferCreateRequest(BaseModel):
    rate_toman: int = Field(..., ge=0)
    description: str | None = Field(default=None, max_length=2000)
    proposed_euro_amount: int | None = Field(default=None, gt=0)
    proposer_account_country: str | None = Field(default=None, max_length=80)
