import { FriendshipQueryStatus, FriendshipQueryType } from './dto/find-friendships-query.dto';
import {
  FriendsRelationshipStatus,
  FriendsSortBy,
  FriendsSortDirection,
} from './dto/find-friends-query.dto';
import { FriendshipsService } from './friendships.service';

const publicUser = {
  id: 1n,
  email: 'user@example.com',
  username: 'user',
  displayName: 'User Name',
  avatarUrl: null,
  lastSeenAt: null,
};

describe('FriendshipsService', () => {
  const createService = () => {
    const prisma = {
      user: {
        findUnique: jest.fn(),
      },
      friendship: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const service = new FriendshipsService(prisma as never);

    return {
      service,
      prisma,
    };
  };

  it('lists received pending friendships for the authenticated user', async () => {
    const { service, prisma } = createService();
    const updatedAt = new Date('2026-05-18T12:00:00.000Z');

    prisma.friendship.findMany.mockResolvedValue([
      {
        id: 10n,
        requesterId: 2n,
        addresseeId: 1n,
        status: 'PENDING',
        createdAt: updatedAt,
        updatedAt,
        requester: {
          ...publicUser,
          id: 2n,
          email: 'keynaka@email.com',
          username: 'keynaka',
          displayName: 'Key Naka',
          avatarUrl: 'https://example.com/avatar.png',
        },
        addressee: publicUser,
      },
    ]);

    const response = await service.findByUser('1', {
      type: FriendshipQueryType.Received,
      status: FriendshipQueryStatus.Pending,
    });

    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          addresseeId: 1n,
          status: 'PENDING',
        },
        include: expect.any(Object),
      }),
    );
    expect(response).toEqual([
      expect.objectContaining({
        id: '10',
        requesterId: '2',
        addresseeId: '1',
        status: 'PENDING',
        addressee: {
          id: '1',
          email: 'user@example.com',
          username: 'user',
          displayName: 'User Name',
          avatarUrl: null,
          lastSeenAt: null,
        },
        requester: expect.objectContaining({
          id: '2',
          email: 'keynaka@email.com',
          username: 'keynaka',
          displayName: 'Key Naka',
          avatarUrl: 'https://example.com/avatar.png',
          lastSeenAt: null,
        }),
      }),
    ]);
  });

  it('maps rejected query status to declined persisted status', async () => {
    const { service, prisma } = createService();

    prisma.friendship.findMany.mockResolvedValue([]);

    await service.findByUser('1', {
      status: FriendshipQueryStatus.Rejected,
    });

    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'DECLINED',
        }),
        include: {
          requester: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              lastSeenAt: true,
            },
          },
          addressee: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              lastSeenAt: true,
            },
          },
        },
      }),
    );
  });

  it('lists accepted friends filtered by accepted date range and friend email', async () => {
    const { service, prisma } = createService();
    const from = '2026-05-01T00:00:00.000Z';
    const to = '2026-05-31T23:59:59.999Z';
    const updatedAt = new Date('2026-05-18T12:00:00.000Z');
    const acceptedAt = new Date('2026-05-18T12:00:00.000Z');
    const lastSeenAt = new Date('2026-05-18T11:00:00.000Z');

    prisma.friendship.findMany.mockResolvedValue([
      {
        id: 20n,
        requesterId: 1n,
        addresseeId: 2n,
        status: 'ACCEPTED',
        acceptedAt,
        createdAt: updatedAt,
        updatedAt,
        requester: publicUser,
        addressee: {
          ...publicUser,
          id: 2n,
          email: 'keynaka@email.com',
          username: 'keynaka',
          displayName: 'Key Naka',
          avatarUrl: 'https://example.com/avatar.png',
          lastSeenAt,
        },
      },
    ]);

    const response = await service.findFriends('1', {
      acceptedFrom: from,
      acceptedTo: to,
      email: 'keynaka@email.com',
    });

    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'ACCEPTED',
          acceptedAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
          OR: [
            {
              requesterId: 1n,
              addressee: {
                AND: [
                  {
                    email: {
                      equals: 'keynaka@email.com',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
            {
              addresseeId: 1n,
              requester: {
                AND: [
                  {
                    email: {
                      equals: 'keynaka@email.com',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ],
        },
        include: expect.any(Object),
      }),
    );
    expect(response).toEqual({
      data: [
        expect.objectContaining({
          id: '20',
          status: 'ACCEPTED',
          acceptedAt,
          friend: expect.objectContaining({
            id: '2',
            email: 'keynaka@email.com',
            lastSeenAt,
          }),
        }),
      ],
      pagination: {
        limit: 20,
        nextCursor: null,
        hasNextPage: false,
      },
    });
  });

  it('lists rejected relationships without exposing requester and addressee payloads', async () => {
    const { service, prisma } = createService();
    const updatedAt = new Date('2026-05-18T12:00:00.000Z');

    prisma.friendship.findMany.mockResolvedValue([
      {
        id: 30n,
        requesterId: 3n,
        addresseeId: 1n,
        status: 'DECLINED',
        acceptedAt: null,
        createdAt: updatedAt,
        updatedAt,
        requester: {
          ...publicUser,
          id: 3n,
          email: 'rejected@example.com',
          username: 'rejected',
          displayName: 'Rejected User',
        },
        addressee: publicUser,
      },
    ]);

    const response = await service.findFriends('1', {
      status: FriendsRelationshipStatus.Rejected,
      sortBy: FriendsSortBy.DisplayName,
      sortDirection: FriendsSortDirection.Asc,
    });

    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'DECLINED',
          OR: [
            {
              requesterId: 1n,
            },
            {
              addresseeId: 1n,
            },
          ],
        }),
      }),
    );
    expect(response).toEqual({
      data: [
        {
          id: '30',
          status: 'DECLINED',
          acceptedAt: null,
          createdAt: updatedAt,
          updatedAt,
          friend: expect.objectContaining({
            id: '3',
            email: 'rejected@example.com',
            displayName: 'Rejected User',
          }),
        },
      ],
      pagination: {
        limit: 20,
        nextCursor: null,
        hasNextPage: false,
      },
    });
    expect(response.data[0]).not.toHaveProperty('requester');
    expect(response.data[0]).not.toHaveProperty('addressee');
    expect(response.data[0]).not.toHaveProperty('requesterId');
    expect(response.data[0]).not.toHaveProperty('addresseeId');
  });

  it('maps blocked relationship filter to the persisted status', async () => {
    const { service, prisma } = createService();

    prisma.friendship.findMany.mockResolvedValue([]);

    await service.findFriends('1', {
      status: FriendsRelationshipStatus.Blocked,
    });

    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'BLOCKED',
        }),
      }),
    );
  });

  it('searches, sorts, and paginates accepted friends', async () => {
    const { service, prisma } = createService();

    prisma.friendship.findMany.mockResolvedValue([
      {
        id: 20n,
        requesterId: 1n,
        addresseeId: 2n,
        status: 'ACCEPTED',
        acceptedAt: new Date('2026-05-18T12:00:00.000Z'),
        createdAt: new Date('2026-05-18T12:00:00.000Z'),
        updatedAt: new Date('2026-05-18T12:00:00.000Z'),
        requester: publicUser,
        addressee: {
          ...publicUser,
          id: 2n,
          email: 'zoe@example.com',
          username: 'zoe',
          displayName: 'Zoe Friend',
        },
      },
      {
        id: 21n,
        requesterId: 3n,
        addresseeId: 1n,
        status: 'ACCEPTED',
        acceptedAt: new Date('2026-05-17T12:00:00.000Z'),
        createdAt: new Date('2026-05-17T12:00:00.000Z'),
        updatedAt: new Date('2026-05-17T12:00:00.000Z'),
        requester: {
          ...publicUser,
          id: 3n,
          email: 'ana@example.com',
          username: 'ana',
          displayName: 'Ana Friend',
        },
        addressee: publicUser,
      },
      {
        id: 22n,
        requesterId: 1n,
        addresseeId: 4n,
        status: 'ACCEPTED',
        acceptedAt: new Date('2026-05-16T12:00:00.000Z'),
        createdAt: new Date('2026-05-16T12:00:00.000Z'),
        updatedAt: new Date('2026-05-16T12:00:00.000Z'),
        requester: publicUser,
        addressee: {
          ...publicUser,
          id: 4n,
          email: 'bob@example.com',
          username: 'bob',
          displayName: 'Bob Friend',
        },
      },
    ]);

    const response = await service.findFriends('1', {
      search: 'friend',
      sortBy: FriendsSortBy.DisplayName,
      sortDirection: FriendsSortDirection.Asc,
      limit: 2,
    });

    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            {
              requesterId: 1n,
              addressee: {
                AND: [
                  {
                    OR: expect.any(Array),
                  },
                ],
              },
            },
            {
              addresseeId: 1n,
              requester: {
                AND: [
                  {
                    OR: expect.any(Array),
                  },
                ],
              },
            },
          ],
        }),
      }),
    );
    expect(response).toEqual({
      data: [
        expect.objectContaining({
          id: '21',
          friend: expect.objectContaining({ displayName: 'Ana Friend' }),
        }),
        expect.objectContaining({
          id: '22',
          friend: expect.objectContaining({ displayName: 'Bob Friend' }),
        }),
      ],
      pagination: {
        limit: 2,
        nextCursor: '22',
        hasNextPage: true,
      },
    });
  });

  it('rejects invalid friend date ranges', async () => {
    const { service, prisma } = createService();

    await expect(
      service.findFriends('1', {
        acceptedFrom: '2026-06-01T00:00:00.000Z',
        acceptedTo: '2026-05-01T00:00:00.000Z',
      }),
    ).rejects.toThrow('acceptedFrom must be before or equal to acceptedTo.');
    expect(prisma.friendship.findMany).not.toHaveBeenCalled();
  });
});
