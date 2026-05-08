import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseId } from '../../common/utils/parse-id';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { mapToPublicUser } from './public-user.mapper';
import { userPublicSelect } from './user.select';

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
}
