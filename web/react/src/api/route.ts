import api from "./api";
import type {
  AuthResponse,
  CreateTodoInput,
  LoginInput,
  RegisterInput,
  Todo,
  UpdateTodoInput,
  UpdateUserInput,
  User,
} from "../types/api";

export const authApi = {
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/users/register", input);
    return data;
  },
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/users/login", input);
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },
};

export const userApi = {
  get: async (id: number): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
  update: async (id: number, input: UpdateUserInput): Promise<User> => {
    const { data } = await api.put<User>(`/users/${id}`, input);
    return data;
  },
  remove: async (id: number): Promise<User> => {
    const { data } = await api.delete<User>(`/users/${id}`);
    return data;
  },
};

export const todoApi = {
  list: async (): Promise<Todo[]> => {
    const { data } = await api.get<Todo[]>("/todos");
    return data;
  },
  get: async (id: number): Promise<Todo> => {
    const { data } = await api.get<Todo>(`/todos/${id}`);
    return data;
  },
  create: async (input: CreateTodoInput): Promise<Todo> => {
    const { data } = await api.post<Todo>("/todos", input);
    return data;
  },
  update: async (id: number, input: UpdateTodoInput): Promise<Todo> => {
    const { data } = await api.put<Todo>(`/todos/${id}`, input);
    return data;
  },
  remove: async (id: number): Promise<Todo> => {
    const { data } = await api.delete<Todo>(`/todos/${id}`);
    return data;
  },
};
