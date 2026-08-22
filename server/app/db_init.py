import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.orm import DeclarativeBase

from app.db import Base, engine


def reconcile_columns(engine):
 """Additive schema migration: add missing columns only."""
 inspector = inspect(engine)
 existing_tables = set(inspector.get_table_names())

 # Map table name -> list of Column objects from models
 model_tables: dict[str, list] = {}
 for cls in Base.__subclasses__():
 table = cls.__table__
 model_tables[table.name] = list(table.columns)

 for table_name, model_cols in model_tables.items():
 if table_name not in existing_tables:
 continue
 existing_cols = {c["name"] for c in inspector.get_columns(table_name)}
 for col in model_cols:
 if col.name not in existing_cols:
 col_type = col.type.compile(engine.dialect) if hasattr(col.type, "compile") else str(col.type)
 nullable = "" if col.nullable else "NOT NULL"
 default = ""
 if col.default is not None:
 default_val = col.default.arg
 if isinstance(default_val, str):
 default = f"DEFAULT '{default_val}'"
 else:
 default = f"DEFAULT {default_val}"
 try:
 with engine.connect() as conn:
 conn.execute(sa.text(
 f"ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type} {nullable} {default}"
 ))
 conn.commit()
 except Exception:
 pass # column may have been added concurrently
