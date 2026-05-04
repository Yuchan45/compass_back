import { Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
      select: userPublicSelect,
    });

    return mapToPublicUser(user);
  }
}
