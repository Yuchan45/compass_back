import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseId } from '../../common/utils/parse-id';
import { serializeBigInts } from '../../common/utils/serialize-bigint';
import { PrismaService } from '../../database/prisma.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import {
  FindFriendsQueryDto,
  FriendsRelationshipStatus,
  FriendsSortBy,
  FriendsSortDirection,
} from './dto/find-friends-query.dto';
import {
  FindFriendshipsQueryDto,
  FriendshipQueryStatus,
  FriendshipQueryType,
} from './dto/find-friendships-query.dto';

const friendshipUserBasicSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  lastSeenAt: true,
};

const friendshipInclude = {
  requester: {
    select: friendshipUserBasicSelect,
  },
  addressee: {
    select: friendshipUserBasicSelect,
  },
};

type FriendshipWithUsers = {
  id: bigint;
  requesterId: bigint;
  addresseeId: bigint;
  status: string;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  requester: FriendUser;
  addressee: FriendUser;
};

type FriendUser = {
  id: bigint;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  lastSeenAt: Date | null;
};

const DEFAULT_FRIENDS_LIMIT = 20;
const MAX_FRIENDS_LIMIT = 100;

@Injectable()
export class FriendshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(requesterId: string, dto: CreateFriendRequestDto) {
    if (requesterId === dto.addresseeId) {
      throw new BadRequestException('You cannot send a friend request to yourself.');
    }

    const requesterDbId = parseId(requesterId, 'requesterId');
    const addresseeDbId = parseId(dto.addresseeId, 'addresseeId');

    const addressee = await this.prisma.user.findUnique({
      where: {
        id: addresseeDbId,
      },
      select: {
        id: true,
      },
    });

    if (!addressee) {
      throw new NotFoundException('User not found.');
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: requesterDbId,
            addresseeId: addresseeDbId,
          },
          {
            requesterId: addresseeDbId,
            addresseeId: requesterDbId,
          },
        ],
      },
    });

    if (existingFriendship) {
      throw new ConflictException('Friendship already exists.');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId: requesterDbId,
        addresseeId: addresseeDbId,
      },
      include: friendshipInclude,
    });

    return serializeBigInts(friendship);
  }

  async acceptRequest(userId: string, friendshipId: string) {
    const userDbId = parseId(userId, 'userId');
    const friendshipDbId = parseId(friendshipId, 'id');
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        id: friendshipDbId,
        addresseeId: userDbId,
        status: 'PENDING',
      },
    });

    if (!friendship) {
      throw new NotFoundException('Pending friend request not found.');
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: {
        id: friendshipDbId,
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: friendshipInclude,
    });

    return serializeBigInts(updatedFriendship);
  }

  async declineRequest(userId: string, friendshipId: string) {
    const userDbId = parseId(userId, 'userId');
    const friendshipDbId = parseId(friendshipId, 'id');
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        id: friendshipDbId,
        addresseeId: userDbId,
        status: 'PENDING',
      },
    });

    if (!friendship) {
      throw new NotFoundException('Pending friend request not found.');
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: {
        id: friendshipDbId,
      },
      data: {
        status: 'DECLINED',
      },
      include: friendshipInclude,
    });

    return serializeBigInts(updatedFriendship);
  }

  async findByUser(userId: string, query: FindFriendshipsQueryDto = {}) {
    const userDbId = parseId(userId, 'userId');
    const status = this.mapQueryStatus(query.status);
    const userWhere =
      query.type === FriendshipQueryType.Sent
        ? { requesterId: userDbId }
        : query.type === FriendshipQueryType.Received
          ? { addresseeId: userDbId }
          : {
              OR: [
                {
                  requesterId: userDbId,
                },
                {
                  addresseeId: userDbId,
                },
              ],
            };
    const friendships = await this.prisma.friendship.findMany({
      where: {
        ...userWhere,
        ...(status ? { status } : {}),
      },
      include: friendshipInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return serializeBigInts(friendships);
  }

  async findFriends(userId: string, query: FindFriendsQueryDto = {}) {
    const userDbId = parseId(userId, 'userId');
    const fromInput = query.acceptedFrom ?? query.from;
    const toInput = query.acceptedTo ?? query.to;
    const from = fromInput ? new Date(fromInput) : undefined;
    const to = toInput ? new Date(toInput) : undefined;
    const limit = Math.min(Number(query.limit ?? DEFAULT_FRIENDS_LIMIT), MAX_FRIENDS_LIMIT);
    const sortBy = query.sortBy ?? FriendsSortBy.AcceptedAt;
    const sortDirection = query.sortDirection ?? FriendsSortDirection.Desc;
    const search = query.search?.trim() || undefined;
    const relationshipStatus = this.mapFriendsRelationshipStatus(query.status);

    if (from && to && from > to) {
      throw new BadRequestException('acceptedFrom must be before or equal to acceptedTo.');
    }

    const friendWhere = this.buildFriendWhere(query.email, search);
    const acceptedAtWhere =
      from || to
        ? {
            acceptedAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {};

    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: relationshipStatus,
        ...acceptedAtWhere,
        OR: [
          {
            requesterId: userDbId,
            ...(friendWhere ? { addressee: friendWhere } : {}),
          },
          {
            addresseeId: userDbId,
            ...(friendWhere ? { requester: friendWhere } : {}),
          },
        ],
      },
      include: friendshipInclude,
    });

    const sortedFriendships = this.sortFriendships(friendships, userDbId, sortBy, sortDirection);
    const startIndex = this.getCursorStartIndex(sortedFriendships, query.cursor);
    const page = sortedFriendships.slice(startIndex, startIndex + limit + 1);
    const hasNextPage = page.length > limit;
    const data = page
      .slice(0, limit)
      .map((friendship) => this.mapFriendshipRelationship(friendship, userDbId));

    return serializeBigInts({
      data,
      pagination: {
        limit,
        nextCursor: hasNextPage ? page[limit - 1].id : null,
        hasNextPage,
      },
    });
  }

  private mapQueryStatus(status?: FriendshipQueryStatus) {
    return status === FriendshipQueryStatus.Rejected ? 'DECLINED' : status;
  }

  private mapFriendsRelationshipStatus(status = FriendsRelationshipStatus.Accepted) {
    if (status === FriendsRelationshipStatus.Rejected) {
      return 'DECLINED';
    }

    if (status === FriendsRelationshipStatus.Blocked) {
      return 'BLOCKED';
    }

    return 'ACCEPTED';
  }

  private buildFriendWhere(email?: string, search?: string) {
    const conditions = [];

    if (email) {
      conditions.push({
        email: {
          equals: email,
          mode: 'insensitive' as const,
        },
      });
    }

    if (search) {
      conditions.push({
        OR: [
          {
            email: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            username: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            displayName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      });
    }

    return conditions.length > 0 ? { AND: conditions } : undefined;
  }

  private sortFriendships(
    friendships: FriendshipWithUsers[],
    userDbId: bigint,
    sortBy: FriendsSortBy,
    sortDirection: FriendsSortDirection,
  ) {
    const direction = sortDirection === FriendsSortDirection.Asc ? 1 : -1;

    return [...friendships].sort((a, b) => {
      const result = this.compareFriendships(a, b, userDbId, sortBy, direction);

      if (result !== 0) {
        return result;
      }

      return this.compareBigInts(a.id, b.id) * direction;
    });
  }

  private compareFriendships(
    a: FriendshipWithUsers,
    b: FriendshipWithUsers,
    userDbId: bigint,
    sortBy: FriendsSortBy,
    direction: number,
  ) {
    if (sortBy === FriendsSortBy.DisplayName) {
      return (
        this.getFriend(a, userDbId).displayName.localeCompare(
          this.getFriend(b, userDbId).displayName,
          undefined,
          { sensitivity: 'base' },
        ) * direction
      );
    }

    const left =
      sortBy === FriendsSortBy.LastSeenAt ? this.getFriend(a, userDbId).lastSeenAt : a.acceptedAt;
    const right =
      sortBy === FriendsSortBy.LastSeenAt ? this.getFriend(b, userDbId).lastSeenAt : b.acceptedAt;

    return this.compareNullableDates(left, right, direction);
  }

  private getCursorStartIndex(friendships: FriendshipWithUsers[], cursor?: string) {
    if (!cursor) {
      return 0;
    }

    const cursorDbId = parseId(cursor, 'cursor');
    const cursorIndex = friendships.findIndex((friendship) => friendship.id === cursorDbId);

    if (cursorIndex === -1) {
      throw new BadRequestException('Invalid cursor.');
    }

    return cursorIndex + 1;
  }

  private getFriend(friendship: FriendshipWithUsers, userDbId: bigint) {
    return friendship.requesterId === userDbId ? friendship.addressee : friendship.requester;
  }

  private mapFriendshipRelationship(friendship: FriendshipWithUsers, userDbId: bigint) {
    return {
      id: friendship.id,
      status: friendship.status,
      acceptedAt: friendship.acceptedAt,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
      friend: this.getFriend(friendship, userDbId),
    };
  }

  private compareNullableDates(left: Date | null, right: Date | null, direction: number) {
    if (!left && !right) {
      return 0;
    }

    if (!left) {
      return 1;
    }

    if (!right) {
      return -1;
    }

    return (left.getTime() - right.getTime()) * direction;
  }

  private compareBigInts(left: bigint, right: bigint) {
    if (left === right) {
      return 0;
    }

    return left > right ? 1 : -1;
  }
}
