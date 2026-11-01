import uuid

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Todo, TodoCreate, TodoUpdate, User, UserCreate, UserUpdate


# --------------------------------------------------------------------------- #
# User
# --------------------------------------------------------------------------- #
def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data: dict[str, str] = {}
    if "password" in user_data:
        password = user_data.pop("password")
        extra_data["hashed_password"] = get_password_hash(password)
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if db_user is None:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


# --------------------------------------------------------------------------- #
# Todo
# --------------------------------------------------------------------------- #
def create_todo(
    *, session: Session, todo_create: TodoCreate, owner_id: uuid.UUID
) -> Todo:
    db_obj = Todo.model_validate(todo_create, update={"owner_id": owner_id})
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_todos(
    *, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> list[Todo]:
    statement = (
        select(Todo)
        .where(Todo.owner_id == owner_id)
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(statement).all())


def count_todos(*, session: Session, owner_id: uuid.UUID) -> int:
    statement = (
        select(func.count()).select_from(Todo).where(Todo.owner_id == owner_id)
    )
    return session.exec(statement).one()


def get_todo(
    *, session: Session, todo_id: uuid.UUID, owner_id: uuid.UUID
) -> Todo | None:
    db_todo = session.get(Todo, todo_id)
    if db_todo is None or db_todo.owner_id != owner_id:
        return None
    return db_todo


def update_todo(*, session: Session, db_todo: Todo, todo_in: TodoUpdate) -> Todo:
    todo_data = todo_in.model_dump(exclude_unset=True)
    db_todo.sqlmodel_update(todo_data)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo


def delete_todo(*, session: Session, db_todo: Todo) -> None:
    session.delete(db_todo)
    session.commit()
