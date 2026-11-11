import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      (errors[key] ??= []).push(issue.message);
    }

    throw new BadRequestException({
      statusCode: 400,
      message: Object.values(errors).flat().join(', '),
      errors,
    });
  }
}
