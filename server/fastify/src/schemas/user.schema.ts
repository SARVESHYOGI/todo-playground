export interface RegisterBody {
  email: string;
  username?: string | null;
  name?: string | null;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserUpdateBody {
  email?: string;
  username?: string | null;
  name?: string | null;
}

export const registerSchema = {
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email", maxLength: 254 },
    username: { type: ["string", "null"], maxLength: 50 },
    name: { type: ["string", "null"], maxLength: 100 },
    password: { type: "string", minLength: 8, maxLength: 200 },
  },
} as const;

export const loginSchema = {
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
} as const;

export const userUpdateSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    email: { type: "string", format: "email", maxLength: 254 },
    username: { type: ["string", "null"], maxLength: 50 },
    name: { type: ["string", "null"], maxLength: 100 },
  },
} as const;

export const publicUserSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    email: { type: "string" },
    username: { type: ["string", "null"] },
    name: { type: ["string", "null"] },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
} as const;

export const authResponseSchema = {
  type: "object",
  properties: {
    user: publicUserSchema,
    token: { type: "string" },
  },
} as const;
