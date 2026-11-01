import uuid

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Message, TodoCreate, TodoPublic, TodosPublic, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("/")
def read_todos(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> TodosPublic:
    todos = crud.list_todos(
        session=session, owner_id=current_user.id, skip=skip, limit=limit
    )
    count = crud.count_todos(session=session, owner_id=current_user.id)
    return TodosPublic(
        data=[TodoPublic.model_validate(todo) for todo in todos], count=count
    )


@router.post("/")
def create_todo(
    *, session: SessionDep, current_user: CurrentUser, todo_in: TodoCreate
) -> TodoPublic:
    todo = crud.create_todo(
        session=session, todo_create=todo_in, owner_id=current_user.id
    )
    return TodoPublic.model_validate(todo)


@router.get("/{todo_id}")
def read_todo(
    todo_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> TodoPublic:
    todo = crud.get_todo(session=session, todo_id=todo_id, owner_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoPublic.model_validate(todo)


@router.patch("/{todo_id}")
def update_todo(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    todo_id: uuid.UUID,
    todo_in: TodoUpdate,
) -> TodoPublic:
    todo = crud.get_todo(session=session, todo_id=todo_id, owner_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo = crud.update_todo(session=session, db_todo=todo, todo_in=todo_in)
    return TodoPublic.model_validate(todo)


@router.delete("/{todo_id}")
def delete_todo(
    todo_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Message:
    todo = crud.get_todo(session=session, todo_id=todo_id, owner_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    crud.delete_todo(session=session, db_todo=todo)
    return Message(message="Todo deleted successfully")
