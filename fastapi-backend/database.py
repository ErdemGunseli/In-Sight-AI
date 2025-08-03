import os

from sqlalchemy import create_engine, MetaData
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

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
