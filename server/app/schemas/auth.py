"""Pydantic v2 schemas for auth endpoints."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class RegisterRequest(BaseModel):
 name: str
 email: EmailStr
 password: str = Field(min_length=8)
 org_name: str


class LoginRequest(BaseModel):
 email: EmailStr
 password: str


class RefreshRequest(BaseModel):
 refresh_token: str


class TokenResponse(BaseModel):
 access_token: str
 refresh_token: str
 token_type: str = "bearer"


class UserOut(BaseModel):
 id: str
 email: str
 name: str | None = None
 role: str
 org_id: str
 org_name: str | None = None
 created_at: datetime | None = None

 class Config:
 from_attributes = True
