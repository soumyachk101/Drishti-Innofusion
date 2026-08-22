from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy import create_engine

from app.config import settings

# Use async engine for PostgreSQL, sync for SQLite
is_sqlite = settings.database_url.startswith("sqlite")

if is_sqlite:
 engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
 SessionLocal = sessionmaker(bind=engine, class_=Session, autoflush=False, autocommit=False)

 async_engine = create_async_engine(
 "sqlite+aiosqlite:///./drishti.db",
 connect_args={"check_same_thread": False},
 )
else:
 # PostgreSQL with psycopg v3 (async)
 async_url = settings.database_url.replace("postgresql://", "postgresql+psycopg://")
 async_engine = create_async_engine(async_url, pool_pre_ping=True)
 engine = create_engine(settings.database_url.replace("postgresql://", "postgresql+psycopg://"), pool_pre_ping=True)
 SessionLocal = sessionmaker(bind=engine, class_=Session, autoflush=False, autocommit=False)

AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
 pass


def get_db() -> Session:
 db = SessionLocal()
 try:
 yield db
 finally:
 db.close()


async def get_async_db() -> AsyncSession:
 async with AsyncSessionLocal() as session:
 yield session
