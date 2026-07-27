export function serializeBigInts<T>(value: T): T {
  if (typeof value === 'bigint') {
    return value.toString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInts(item)) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => [key, serializeBigInts(item)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}
