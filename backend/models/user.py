"""
User model
"""

from sqlalchemy import String, Enum as SQLEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum

from models.base import BaseModel


class UserRole(str, Enum):
    """User roles"""
    ADMIN = "admin"
    USER = "user"
    AGENT = "agent"


class User(BaseModel):
    """User model for authentication and identification"""
    
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
