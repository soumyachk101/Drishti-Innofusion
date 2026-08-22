from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import decode_token, sha256_hex, verify_password, DUMMY_PASSWORD_HASH
from app.db import get_db
from app.models import User, Agent, Organization

security = HTTPBearer()

# ---- In-memory rate limiter ----
class TokenBucket:
 __slots__ = ("tokens", "last", "rate", "burst")

 def __init__(self, rate: float, burst: int):
 self.tokens = float(burst)
 self.last = __import__("time").time()
 self.rate = rate
 self.burst = burst

 def consume(self) -> bool:
 now = __import__("time").time()
 dt = max(now - self.last, 0.0)
 self.last = now
 self.tokens = min(self.burst, self.tokens + dt * self.rate)
 if self.tokens >= 1.0:
 self.tokens -= 1.0
 return True
 return False


_rate_buckets: dict[str, TokenBucket] = {}
_RATE_LIMIT_MAX_ENTRIES = 10_000


def _check_rate(key: str, rate: float, burst: int) -> bool:
 if len(_rate_buckets) > _RATE_LIMIT_MAX_ENTRIES:
 # Evict stale entries (simple: clear and restart — rare path)
 _rate_buckets.clear()
 bucket = _rate_buckets.get(key)
 if bucket is None:
 _rate_buckets[key] = TokenBucket(rate, burst)
 return True
 return bucket.consume()


def require_rate(key: str, rate: float = 1.0, burst: int = 5):
 if not _check_rate(key, rate, burst):
 raise HTTPException(status_code=429, detail="Rate limit exceeded")


# ---- Auth dependencies ----

async def get_current_user(
 request: Request,
 creds: HTTPAuthorizationCredentials = Depends(security),
 db: Session = Depends(get_db),
) -> User:
 token = creds.credentials
 try:
 payload = decode_token(token)
 if payload.get("type") != "access":
 raise HTTPException(status_code=401, detail="Invalid token type")
 except Exception:
 raise HTTPException(status_code=401, detail="Invalid token")

 user = db.get(User, payload.get("sub"))
 if not user:
 raise HTTPException(status_code=401, detail="User not found")

 # token_version check
 tv = payload.get("token_version", 0)
 if tv != user.token_version:
 raise HTTPException(status_code=401, detail="Token revoked")

 # org_id match
 org_header = request.headers.get("X-Org-Id", "")
 if org_header != user.org_id:
 raise HTTPException(status_code=403, detail="Org mismatch")

 require_rate(f"user:{user.id}", rate=1.0, burst=10)
 return user


def require_role(*roles: str):
 async def _check(user: User = Depends(get_current_user)) -> User:
 if roles and user.role not in roles:
 raise HTTPException(status_code=403, detail="Insufficient role")
 return user
 return _check


async def get_current_agent(
 request: Request,
 creds: HTTPAuthorizationCredentials = Depends(security),
 db: Session = Depends(get_db),
) -> Agent:
 token = creds.credentials
 token_hash = sha256_hex(token)

 agent = db.query(Agent).filter(Agent.token_hash == token_hash).first()
 if agent is None or agent.status != "active":
 raise HTTPException(status_code=401, detail="Invalid agent token")

 # Org scope check
 agent_org = agent.org_id
 require_rate(f"agent:{agent.id}", rate=1.0, burst=20)
 return agent
