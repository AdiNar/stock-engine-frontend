from datetime import datetime
import json

from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer, Text,
                        func)
from sqlalchemy.orm import relationship

from globals import BaseModel


class ModelEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, BaseModel):
            return dict((c.name, getattr(obj, c.name)) for c in obj.__table__.columns)


class User(BaseModel):
    id = Column(Integer, primary_key=True)
    username = Column(Text, unique=True)
    password = Column(Text)
    roles = Column(Text)
    fcm_token = Column(Text, default=None, unique=True)
    is_active = Column(Boolean, default=True, server_default="true")
    queries = relationship(
        "Query", back_populates="user", cascade="all, delete", passive_deletes=True
    )

    @property
    def rolenames(self):
        try:
            return self.roles.split(",")
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def is_valid(self):
        return self.is_active


class Query(BaseModel):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    name = Column(Text)
    watch = Column(Boolean, default=False)
    query = Column(Text, nullable=False)
    state = Column(Text, nullable=False, default="QUEUED")
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=datetime.now,
        nullable=False,
    )

    history = relationship(
        "QueryHistory",
        back_populates="query",
        cascade="all, delete",
        passive_deletes=True,
    )
    user = relationship("User", back_populates="queries")


class QueryHistory(BaseModel):
    id = Column(Integer, primary_key=True)
    query_id = Column(Integer, ForeignKey("query.id"))
    result = Column(Text)
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=datetime.now(),
        nullable=False,
    )

    query = relationship("Query", back_populates="history")
