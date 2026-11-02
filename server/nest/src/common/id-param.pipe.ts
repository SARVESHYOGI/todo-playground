import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";

/**
 * The express sibling's `validateIdParam`: a positive integer path segment.
 * "007" and "1e3" are accepted because `Number()` accepts them there too.
 */
@Injectable()
export class IdParamPipe implements PipeTransform<string, number> {
  constructor(private readonly param = "id") {}

  transform(value: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException({ errors: [`"${this.param}" must be a positive integer`] });
    }
    return parsed;
  }
}
