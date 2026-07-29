import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserColorTheme } from '@prisma/client';
import { parseId } from '../../common/utils/parse-id';
import { serializeBigInts } from '../../common/utils/serialize-bigint';
import { PrismaService } from '../../database/prisma.service';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ColorThemePreference, UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { mapToPublicUser } from './public-user.mapper';
import { userPublicSelect } from './user.select';

const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 50;

const searchableUserSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  lastSeenAt: true,
  requestedFriendships: {
    select: {
      id: true,
      requesterId: true,
      addresseeId: true,
      status: true,
    },
  },
  receivedFriendships: {
    select: {
      id: true,
      requesterId: true,
      addresseeId: true,
      status: true,
    },
  },
};

type SearchableUser = {
  id: bigint;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  lastSeenAt: Date | null;
  requestedFriendships: Relationship[];
  receivedFriendships: Relationship[];
};

type Relationship = {
  id: bigint;
  requesterId: bigint;
  addresseeId: bigint;
  status: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdOrThrow(id: string) {
    const userId = parseId(id, 'id');
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userPublicSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return mapToPublicUser(user);
  }

  async searchProfiles(userId: string, query: SearchUsersQueryDto = {}) {
    const userDbId = parseId(userId, 'userId');
    const search = query.query?.trim();
    const limit = Math.min(Number(query.limit ?? DEFAULT_SEARCH_LIMIT), MAX_SEARCH_LIMIT);
    const currentFriendIds = await this.findAcceptedFriendIds(userDbId);
    const candidates = await this.prisma.user.findMany({
      where: {
        id: {
          not: userDbId,
        },
        ...(search
          ? {
              OR: [
                {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  username: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  displayName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        ...searchableUserSelect,
        requestedFriendships: {
          where: {
            addresseeId: userDbId,
          },
          select: searchableUserSelect.requestedFriendships.select,
        },
        receivedFriendships: {
          where: {
            requesterId: userDbId,
          },
          select: searchableUserSelect.receivedFriendships.select,
        },
      },
    });
    const candidateFriendIdsByUserId = await this.findAcceptedFriendIdsByUser(
      candidates.map((candidate) => candidate.id),
    );
    const data = candidates
      .map((candidate) =>
        this.mapSearchProfile(candidate, currentFriendIds, candidateFriendIdsByUserId),
      )
      .sort((left, right) => {
        if (left.mutualFriendsCount !== right.mutualFriendsCount) {
          return right.mutualFriendsCount - left.mutualFriendsCount;
        }

        return left.profile.displayName.localeCompare(right.profile.displayName, undefined, {
          sensitivity: 'base',
        });
      })
      .slice(0, limit);

    return serializeBigInts({
      data,
      meta: {
        query: search || null,
        limit,
      },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const userId = parseId(id, 'id');
    const data = await this.buildProfileUpdateData(userId, dto);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one profile field must be provided.');
    }

    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data,
        select: userPublicSelect,
      });

      return mapToPublicUser(user);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async updateSettings(id: string, dto: UpdateUserSettingsDto) {
    const userId = parseId(id, 'id');

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one settings field must be provided.');
    }

    await this.prisma.userSettings.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        colorTheme: this.toPrismaColorTheme(dto.colorTheme),
      },
      update: {
        colorTheme: this.toPrismaColorTheme(dto.colorTheme),
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userPublicSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return mapToPublicUser(user);
  }

  async deleteProfile(id: string): Promise<void> {
    const userId = parseId(id, 'id');

    try {
      await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  private async buildProfileUpdateData(
    userId: bigint,
    dto: UpdateProfileDto,
  ): Promise<Prisma.UserUncheckedUpdateInput> {
    const data: Prisma.UserUncheckedUpdateInput = {};
    const email = dto.email ? dto.email.trim().toLowerCase() : undefined;
    const username = dto.username ? dto.username.trim().toLowerCase() : undefined;

    await this.assertProfileFieldsAreAvailable(userId, {
      email,
      username,
    });

    if (email !== undefined) {
      data.email = email;
    }

    if (username !== undefined) {
      data.username = username;
    }

    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName.trim();
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'avatarUrl')) {
      data.avatarUrl = dto.avatarUrl === null ? null : dto.avatarUrl?.trim();
    }

    if (dto.locationSharingEnabled !== undefined) {
      data.locationSharingEnabled = dto.locationSharingEnabled;
    }

    if (dto.languageId !== undefined) {
      const languageId = parseId(dto.languageId, 'languageId');
      const language = await this.prisma.language.findUnique({
        where: {
          id: languageId,
        },
        select: {
          id: true,
        },
      });

      if (!language) {
        throw new NotFoundException('Language not found.');
      }

      data.languageId = languageId;
    }

    return data;
  }

  private async findAcceptedFriendIds(userId: bigint) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          {
            requesterId: userId,
          },
          {
            addresseeId: userId,
          },
        ],
      },
      select: {
        requesterId: true,
        addresseeId: true,
      },
    });

    return new Set(
      friendships.map((friendship) =>
        friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId,
      ),
    );
  }

  private async findAcceptedFriendIdsByUser(userIds: bigint[]) {
    if (userIds.length === 0) {
      return new Map<bigint, Set<bigint>>();
    }

    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          {
            requesterId: {
              in: userIds,
            },
          },
          {
            addresseeId: {
              in: userIds,
            },
          },
        ],
      },
      select: {
        requesterId: true,
        addresseeId: true,
      },
    });
    const friendIdsByUserId = new Map(userIds.map((id) => [id, new Set<bigint>()]));

    for (const friendship of friendships) {
      friendIdsByUserId.get(friendship.requesterId)?.add(friendship.addresseeId);
      friendIdsByUserId.get(friendship.addresseeId)?.add(friendship.requesterId);
    }

    return friendIdsByUserId;
  }

  private mapSearchProfile(
    candidate: SearchableUser,
    currentFriendIds: Set<bigint>,
    candidateFriendIdsByUserId: Map<bigint, Set<bigint>>,
  ) {
    const candidateFriendIds = candidateFriendIdsByUserId.get(candidate.id) ?? new Set<bigint>();
    const mutualFriendsCount = [...candidateFriendIds].filter((friendId) =>
      currentFriendIds.has(friendId),
    ).length;
    const relationship = this.getRelationshipToCurrentUser(candidate);

    return {
      profile: {
        id: candidate.id,
        email: candidate.email,
        username: candidate.username,
        displayName: candidate.displayName,
        avatarUrl: candidate.avatarUrl,
        lastSeenAt: candidate.lastSeenAt,
      },
      mutualFriendsCount,
      relationship: relationship
        ? {
            id: relationship.id,
            status: relationship.status,
            direction: relationship.requesterId === candidate.id ? 'received' : 'sent',
          }
        : null,
    };
  }

  private getRelationshipToCurrentUser(candidate: SearchableUser) {
    return candidate.requestedFriendships[0] ?? candidate.receivedFriendships[0] ?? null;
  }

  private async assertProfileFieldsAreAvailable(
    userId: bigint,
    fields: {
      email?: string;
      username?: string;
    },
  ): Promise<void> {
    const checks = [
      fields.email ? { email: fields.email } : undefined,
      fields.username ? { username: fields.username } : undefined,
    ].filter((check): check is { email: string } | { username: string } => check !== undefined);

    if (checks.length === 0) {
      return;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: {
          not: userId,
        },
        OR: checks,
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (!existingUser) {
      return;
    }

    if (fields.email && existingUser.email === fields.email) {
      throw new ConflictException('Email is already registered.');
    }

    throw new ConflictException('Username is already registered.');
  }

  private handlePrismaWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email or username already registered.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
    }

    throw error;
  }

  private toPrismaColorTheme(colorTheme: ColorThemePreference | undefined) {
    return colorTheme === ColorThemePreference.Dark ? UserColorTheme.DARK : UserColorTheme.LIGHT;
  }
}
