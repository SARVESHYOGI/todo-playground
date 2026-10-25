export type FieldType = "string" | "number" | "boolean";

export interface FieldRule {
  type: FieldType;
  required?: boolean;
  nullable?: boolean;
  email?: boolean;
  integer?: boolean;
  positive?: boolean;
  minLength?: number;
  maxLength?: number;
}

export type ObjectSchema = Record<string, FieldRule>;

export interface ValidationResult {
  value: Record<string, unknown>;
  errors: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateObject(schema: ObjectSchema, input: unknown): ValidationResult {
  const value: Record<string, unknown> = {};
  const errors: string[] = [];

  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { value, errors: ["Request body must be a JSON object"] };
  }

  const source = input as Record<string, unknown>;

  for (const [field, rule] of Object.entries(schema)) {
    const raw = source[field];

    if (raw === undefined) {
      if (rule.required) errors.push(`"${field}" is required`);
      continue;
    }

    if (raw === null) {
      if (rule.nullable) {
        value[field] = null;
      } else {
        errors.push(`"${field}" must not be null`);
      }
      continue;
    }

    if (rule.type === "string") {
      if (typeof raw !== "string") {
        errors.push(`"${field}" must be a string`);
        continue;
      }
      const trimmed = raw.trim();
      if (rule.minLength !== undefined && trimmed.length < rule.minLength) {
        errors.push(`"${field}" must be at least ${rule.minLength} characters`);
        continue;
      }
      if (rule.maxLength !== undefined && trimmed.length > rule.maxLength) {
        errors.push(`"${field}" must be at most ${rule.maxLength} characters`);
        continue;
      }
      if (rule.email && !EMAIL_PATTERN.test(trimmed)) {
        errors.push(`"${field}" must be a valid email`);
        continue;
      }
      value[field] = trimmed;
      continue;
    }

    if (rule.type === "number") {
      if (typeof raw !== "number" || Number.isNaN(raw)) {
        errors.push(`"${field}" must be a number`);
        continue;
      }
      if (rule.integer && !Number.isInteger(raw)) {
        errors.push(`"${field}" must be an integer`);
        continue;
      }
      if (rule.positive && raw <= 0) {
        errors.push(`"${field}" must be a positive number`);
        continue;
      }
      value[field] = raw;
      continue;
    }

    if (rule.type === "boolean") {
      if (typeof raw !== "boolean") {
        errors.push(`"${field}" must be a boolean`);
        continue;
      }
      value[field] = raw;
    }
  }

  for (const key of Object.keys(source)) {
    if (!(key in schema)) errors.push(`"${key}" is not an allowed field`);
  }

  return { value, errors };
}
