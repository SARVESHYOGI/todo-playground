/**
 * Ajv reports validation failures as structured objects. The express sibling
 * answers with `{ errors: ["\"title\" is required"] }`, so translate Ajv's
 * output into the same human-readable strings and keep both APIs identical.
 */
export interface ValidationIssue {
  keyword: string;
  instancePath: string;
  params: Record<string, unknown>;
  message?: string;
}

function fieldName(instancePath: string): string {
  const segment = instancePath.split("/").filter(Boolean).pop();
  return segment ?? "value";
}

export function toValidationMessages(issues: readonly ValidationIssue[]): string[] {
  return issues.map((issue) => {
    const field = fieldName(issue.instancePath);

    switch (issue.keyword) {
      case "required":
        return `"${String(issue.params["missingProperty"])}" is required`;
      case "minLength":
        return `"${field}" must be at least ${String(issue.params["limit"])} characters`;
      case "maxLength":
        return `"${field}" must be at most ${String(issue.params["limit"])} characters`;
      case "format":
        return `"${field}" must be a valid ${String(issue.params["format"])}`;
      case "type":
        return `"${field}" must be a ${String(issue.params["type"])}`;
      case "minProperties":
        return "Request body must include at least one field";
      case "additionalProperties":
        return `"${String(issue.params["additionalProperty"])}" is not an allowed field`;
      case "pattern":
        return `"${field}" must be a positive integer`;
      default:
        return issue.message ?? `"${field}" is invalid`;
    }
  });
}
