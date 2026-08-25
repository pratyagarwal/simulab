"""
Message model for chat functionality
"""

from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from models.base import BaseModel


class Message(BaseModel):
    """Message model for chat channels"""
    
    __tablename__ = "messages"
    
    channel_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    thread_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    reactions: Mapped[dict | None] = mapped_column(JSONB, nullable=True, default={})
    
    def __repr__(self) -> str:
        return f"<Message channel={self.channel_id} author={self.author_id}>"
