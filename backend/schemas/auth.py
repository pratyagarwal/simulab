"""
Authentication related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserLoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserCreateRequest(BaseModel):
    """User registration/creation request."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=255)


class UserResponse(BaseModel):
    """User response for GET /auth/me endpoint."""
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True
