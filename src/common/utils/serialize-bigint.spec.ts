import { serializeBigInts } from './serialize-bigint';

describe('serializeBigInts', () => {
  it('serializes nested BigInt values without mutating Date values', () => {
    const lastSeenAt = new Date('2026-05-18T11:00:00.000Z');

    expect(
      serializeBigInts({
        id: 1n,
        user: {
          id: 2n,
          lastSeenAt,
        },
      }),
    ).toEqual({
      id: '1',
      user: {
        id: '2',
        lastSeenAt,
      },
    });
  });
});
