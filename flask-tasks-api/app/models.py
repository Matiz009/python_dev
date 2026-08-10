"""Database models."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .extensions import db


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Task(db.Model):
    """A single to-do item."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_utcnow,
        onupdate=_utcnow,
        server_default=func.now(),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
        }

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Task {self.id} {self.title!r} done={self.done}>"


def _iso(value: datetime | None) -> str | None:
    """Serialize to ISO-8601 UTC, tolerating naive values from SQLite."""
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC).isoformat()
