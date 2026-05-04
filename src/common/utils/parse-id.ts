import { BadRequestException } from '@nestjs/common';

export function parseId(value: string, fieldName = 'id'): bigint {
  if (!/^\d+$/.test(value)) {
    throw new BadRequestException(`${fieldName} must be a numeric id.`);
  }

  return BigInt(value);
}
