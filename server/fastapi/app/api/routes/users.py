import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlmodel import select

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core.security import get_password_hash, verify_password
from app.models import (
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", dependencies=[Depends(get_current_active_superuser)])
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> UsersPublic:
    count = session.exec(select(func.count()).select_from(User)).one()
    users = session.exec(select(User).offset(skip).limit(limit)).all()
    return UsersPublic(
        data=[UserPublic.model_validate(user) for user in users], count=count
    )


@router.post("/", dependencies=[Depends(get_current_active_superuser)])
def create_user(*, session: SessionDep, user_in: UserCreate) -> UserPublic:
    existing = crud.get_user_by_email(session=session, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.create_user(session=session, user_create=user_in)
    return UserPublic.model_validate(user)


@router.post("/register")
def register_user(*, session: SessionDep, user_in: UserRegister) -> UserPublic:
    existing = crud.get_user_by_email(session=session, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud.create_user(session=session, user_create=user_create)
    return UserPublic.model_validate(user)


@router.get("/me")
def read_user_me(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)


@router.patch("/me")
def update_user_me(
    *, session: SessionDep, current_user: CurrentUser, user_in: UserUpdateMe
) -> UserPublic:
    if user_in.email:
        existing = crud.get_user_by_email(session=session, email=user_in.email)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.patch("/me/password")
def update_password_me(
    *, session: SessionDep, current_user: CurrentUser, body: UpdatePassword
) -> Message:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    current_user.hashed_password = get_password_hash(body.new_password)
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.get("/{user_id}")
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> UserPublic:
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id or current_user.is_superuser:
        return UserPublic.model_validate(user)
    raise HTTPException(
        status_code=403, detail="The user doesn't have enough privileges"
    )


@router.patch("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def update_user(
    *, session: SessionDep, user_id: uuid.UUID, user_in: UserUpdate
) -> UserPublic:
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404, detail="The user with this id does not exist in the system"
        )
    if user_in.email:
        existing = crud.get_user_by_email(session=session, email=user_in.email)
        if existing and existing.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    return UserPublic.model_validate(db_user)


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(session: SessionDep, user_id: uuid.UUID) -> Message:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
