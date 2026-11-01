import type {
  AuthResponse,
  CreateTodoInput,
  EntityId,
  LoginInput,
  RegisterInput,
  Todo,
  UpdateTodoInput,
  UpdateUserInput,
  User,
} from '../../types/api'

/**
 * Contract the UI talks to. Each backend (Express, FastAPI) implements this
 * and maps its own response shapes onto the shared domain types.
 */
export interface BackendAdapter {
  auth: {
    register(input: RegisterInput): Promise<AuthResponse>
    login(input: LoginInput): Promise<AuthResponse>
    me(): Promise<User>
  }
  users: {
    get(id: EntityId): Promise<User>
    update(id: EntityId, input: UpdateUserInput): Promise<User>
    remove(id: EntityId): Promise<void>
  }
  todos: {
    list(): Promise<Todo[]>
    get(id: EntityId): Promise<Todo>
    create(input: CreateTodoInput): Promise<Todo>
    update(id: EntityId, input: UpdateTodoInput): Promise<Todo>
    remove(id: EntityId): Promise<void>
  }
}
