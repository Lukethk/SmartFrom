from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.entities import PasswordResetToken, RevokedToken, User
from app.schemas.auth import (
    ChangePasswordRequest,
    ConfirmPasswordReset,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    RequestPasswordReset,
    TokenPair,
)
from app.schemas.common import APIMessage

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenPair:
    exists = db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
    user = User(email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenPair:
    token_data = decode_token(payload.refresh_token)
    if token_data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    revoked = db.scalar(select(RevokedToken).where(RevokedToken.token == payload.refresh_token))
    if revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    user = db.get(User, token_data.get("sub"))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))


@router.post("/logout", response_model=APIMessage)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)) -> APIMessage:
    db.add(RevokedToken(token=payload.token))
    db.commit()
    return APIMessage(message="Logged out")


@router.post("/password-reset/request", response_model=APIMessage)
def request_reset(payload: RequestPasswordReset, db: Session = Depends(get_db)) -> APIMessage:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        return APIMessage(message="If the email exists, a reset link was generated")
    token = create_reset_token(user.id)
    reset = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )
    db.add(reset)
    db.commit()
    # In production this should be sent via email provider.
    return APIMessage(message=f"Reset token generated: {token}")


@router.post("/password-reset/confirm", response_model=APIMessage)
def confirm_reset(payload: ConfirmPasswordReset, db: Session = Depends(get_db)) -> APIMessage:
    record = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token == payload.token))
    if not record or record.used or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")
    user = db.get(User, record.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.password_hash = hash_password(payload.new_password)
    record.used = True
    db.commit()
    return APIMessage(message="Password changed")


@router.post("/change-password", response_model=APIMessage)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> APIMessage:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid current password")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return APIMessage(message="Password changed")
