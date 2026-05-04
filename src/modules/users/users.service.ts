import { Injectable, NotFoundException } from '@nestjs/common';
import { parseId } from '../../common/utils/parse-id';
import { serializeBigInts } from '../../common/utils/serialize-bigint';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

    return serializeBigInts(user);
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

    return serializeBigInts(user);
  }
}
