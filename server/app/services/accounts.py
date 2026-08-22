"""Account and org management."""
from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import Organization, User, Agent
from app.core.security import hash_password, make_agent_token, verify_password, create_access_token, create_refresh_token, DUMMY_PASSWORD_HASH
from app.core.errors import ConflictError, NotFoundError
from app.config import settings
import bcrypt


def register(db: Session, name: str, email: str, password: str, org_name: str) -> tuple[Organization, User]:
 slug = org_name.lower().replace(" ", "-")[:80]
 existing = db.query(Organization).filter(Organization.slug == slug).first()
 if existing:
 raise ConflictError("Organization slug already exists")

 org = Organization(name=org_name, slug=slug)
 db.add(org)
 db.flush()

 user = User(
 org_id=org.id,
 name=name,
 email=email.lower().strip(),
 password_hash=hash_password(password),
 role="admin",
 )
 db.add(user)
 db.commit()
 return org, user


def login(db: Session, email: str, password: str) -> User:
 user = db.query(User).filter(User.email == email.lower().strip()).first()
 if user is None:
 # Timing-safe dummy verification
 bcrypt.checkpw(password.encode(), DUMMY_PASSWORD_HASH.encode())
 raise NotFoundError("Invalid credentials")

 if not verify_password(password, user.password_hash):
 raise NotFoundError("Invalid credentials")

 return user


def create_tokens(user: User) -> dict:
 return {
 "access_token": create_access_token(user.id, user.org_id, user.role, user.token_version),
 "refresh_token": create_refresh_token(user.id, user.org_id, user.token_version),
 "token_type": "bearer",
 }


def create_agent_token(db: Session, org_id: str, label: str = "") -> tuple[Agent, str]:
 plaintext, token_hash = make_agent_token()
 agent = Agent(
 org_id=org_id,
 agent_key=f"agent-{org_id[:8]}",
 token_hash=token_hash,
 label=label or "default",
 )
 db.add(agent)
 db.commit()
 return agent, plaintext


def update_profile(db: Session, user: User, name: str | None = None, password: str | None = None) -> User:
 if name is not None:
 user.name = name
 if password is not None:
 user.password_hash = hash_password(password)
 user.token_version += 1
 db.commit()
 return user
