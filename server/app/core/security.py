import hashlib
import secrets
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt

from app.config import settings


def sha256_hex(s: str) -> str:
 return hashlib.sha256(s.encode()).hexdigest()


def make_agent_token() -> tuple[str, str]:
 """Returns (plaintext_token, token_hash). Plaintext returned once to caller."""
 plaintext = "drishti_" + secrets.token_urlsafe(24)
 return plaintext, sha256_hex(plaintext)


def verify_password(plain: str, hashed: str) -> bool:
 return bcrypt.checkpw(plain.encode(), hashed.encode())


def hash_password(plain: str) -> str:
 # sha256 pre-hash to handle long/UTF-8 passwords beyond bcrypt's 72-byte limit
 return bcrypt.hashpw(sha256_hex(plain).encode(), bcrypt.gensalt()).decode()


def create_access_token(sub: str, org_id: str, role: str, token_version: int) -> str:
 now = datetime.now(timezone.utc)
 payload = {
 "sub": sub,
 "org_id": org_id,
 "role": role,
 "type": "access",
 "token_version": token_version,
 "iat": now,
 "exp": now + timedelta(minutes=settings.jwt_access_minutes),
 }
 return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(sub: str, org_id: str, token_version: int) -> str:
 now = datetime.now(timezone.utc)
 payload = {
 "sub": sub,
 "org_id": org_id,
 "type": "refresh",
 "token_version": token_version,
 "iat": now,
 "exp": now + timedelta(days=settings.jwt_refresh_days),
 }
 return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict:
 return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


# Precomputed dummy hash for timing-safe unknown-email login
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(32))
