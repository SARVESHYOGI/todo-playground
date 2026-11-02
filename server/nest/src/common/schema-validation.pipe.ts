import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";
import { validateObject, type ObjectSchema } from "./validation";

export interface SchemaValidationOptions {
  requireAtLeastOne?: boolean;
}

/**
 * The express sibling's `validateBody` middleware, expressed as a route pipe.
 * Instantiate it in the handler signature: `@Body(new SchemaValidationPipe(schema))`.
 */
@Injectable()
export class SchemaValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: ObjectSchema,
    private readonly options: SchemaValidationOptions = {}
  ) {}

  transform(input: unknown): Record<string, unknown> {
    const { value, errors } = validateObject(this.schema, input);
    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }

    if (this.options.requireAtLeastOne && Object.keys(value).length === 0) {
      throw new BadRequestException({ errors: ["Request body must include at least one field"] });
    }

    return value;
  }
}
