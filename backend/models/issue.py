"""
Issue model for issue tracking
"""

from sqlalchemy import String, Enum as SQLEnum, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum

from models.base import BaseModel


class IssueStatus(str, Enum):
    """Issue status values"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    BACKLOG = "backlog"


class IssuePriority(str, Enum):
    """Issue priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Issue(BaseModel):
    """Issue model for issue tracking"""
    
    __tablename__ = "issues"
    
    identifier: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[IssueStatus] = mapped_column(
        SQLEnum(IssueStatus),
        default=IssueStatus.OPEN,
        nullable=False,
        index=True
    )
    priority: Mapped[IssuePriority] = mapped_column(
        SQLEnum(IssuePriority),
        default=IssuePriority.MEDIUM,
        nullable=False,
        index=True
    )
    assignee_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    def __repr__(self) -> str:
        return f"<Issue {self.identifier}: {self.title}>"
