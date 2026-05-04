import { Injectable } from '@nestjs/common';
import { parseId } from '../../common/utils/parse-id';
import { serializeBigInts } from '../../common/utils/serialize-bigint';
import { PrismaService } from '../../database/prisma.service';
import { userPublicSelect } from '../users/user.select';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLocation(userId: string, dto: UpdateLocationDto) {
    const userDbId = parseId(userId, 'userId');
    const recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date();
    const [location] = await this.prisma.$transaction([
      this.prisma.location.create({
        data: {
          userId: userDbId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          heading: dto.heading,
          speed: dto.speed,
          batteryLevel: dto.batteryLevel,
          recordedAt,
        },
      }),
      this.prisma.user.update({
        where: {
          id: userDbId,
        },
        data: {
          lastSeenAt: new Date(),
        },
      }),
    ]);

    return serializeBigInts(location);
  }

  async getLatestFriendLocations(userId: string) {
    const friendIds = await this.getAcceptedFriendIds(userId);
    const locations = await Promise.all(
      friendIds.map((friendId) =>
        this.prisma.location.findFirst({
          where: {
            userId: parseId(friendId, 'friendId'),
          },
          orderBy: {
            recordedAt: 'desc',
          },
          include: {
            user: {
              select: userPublicSelect,
            },
          },
        }),
      ),
    );

    return serializeBigInts(locations.filter((location) => location !== null));
  }

  async getAcceptedFriendIds(userId: string): Promise<string[]> {
    const userDbId = parseId(userId, 'userId');
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          {
            requesterId: userDbId,
          },
          {
            addresseeId: userDbId,
          },
        ],
      },
      select: {
        requesterId: true,
        addresseeId: true,
      },
    });

    return friendships.map((friendship) =>
      (friendship.requesterId === userDbId ? friendship.addresseeId : friendship.requesterId).toString(),
    );
  }
}
