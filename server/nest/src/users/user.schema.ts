import type { ObjectSchema } from "../common/validation";

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

export const registerSchema: ObjectSchema = {
  email: { type: "string", required: true, email: true, maxLength: 254 },
  username: { type: "string", maxLength: 50, nullable: true },
  name: { type: "string", maxLength: 100, nullable: true },
  password: { type: "string", required: true, minLength: 8, maxLength: 200 },
};

export const loginSchema: ObjectSchema = {
  email: { type: "string", required: true, email: true },
  password: { type: "string", required: true },
};

export const userUpdateSchema: ObjectSchema = {
  email: { type: "string", email: true, maxLength: 254 },
  username: { type: "string", maxLength: 50, nullable: true },
  name: { type: "string", maxLength: 100, nullable: true },
};
