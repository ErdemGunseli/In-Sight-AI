import os

from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

# If shared DB, set per service:
SCHEMA = os.getenv("SCHEMA", None)

metadata = MetaData(schema=SCHEMA) if SCHEMA else MetaData()
Base = declarative_base(metadata=metadata)

connect_args = {}

# Postgres accepts the option string “-c key=value”:
if SCHEMA: connect_args["options"] = f"-csearch_path=\"{SCHEMA}\""


engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=2,
    future=True,
    connect_args=connect_args,
)

if SCHEMA:
    with engine.begin() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA}"))

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
