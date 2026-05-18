import { FriendshipQueryStatus, FriendshipQueryType } from './dto/find-friendships-query.dto';
import { FriendshipsService } from './friendships.service';

const publicUser = {
  id: 1n,
  email: 'user@example.com',
  username: 'user',
  displayName: 'User Name',
  avatarUrl: null,
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
        },
        requester: expect.objectContaining({
          id: '2',
          email: 'keynaka@email.com',
          username: 'keynaka',
          displayName: 'Key Naka',
          avatarUrl: 'https://example.com/avatar.png',
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
            },
          },
          addressee: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    );
  });
});
