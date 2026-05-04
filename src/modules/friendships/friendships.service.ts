import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseId } from '../../common/utils/parse-id';
import { serializeBigInts } from '../../common/utils/serialize-bigint';
import { PrismaService } from '../../database/prisma.service';
import { userPublicSelect } from '../users/user.select';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';

const friendshipInclude = {
  requester: {
    select: userPublicSelect,
  },
  addressee: {
    select: userPublicSelect,
  },
};

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

  async findByUser(userId: string) {
    const userDbId = parseId(userId, 'userId');
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          {
            requesterId: userDbId,
          },
          {
            addresseeId: userDbId,
          },
        ],
      },
      include: friendshipInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return serializeBigInts(friendships);
  }
}
