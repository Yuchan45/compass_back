import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { parseId } from '../../common/utils/parse-id';
import { userPublicSelect } from '../users/user.select';
import { PublicUser } from '../users/types/public-user.type';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase();
    const username = dto.username.toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already registered.');
    }

    let languageId: bigint;
    if (dto.languageId) {
      languageId = parseId(dto.languageId, 'languageId');
    } else {
      const defaultLanguage = await this.prisma.language.findFirst({
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
        },
      });

      if (defaultLanguage) {
        languageId = defaultLanguage.id;
      } else {
        const createdLanguage = await this.prisma.language.create({
          data: {
            language: 'English',
          },
          select: {
            id: true,
          },
        });
        languageId = createdLanguage.id;
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        languageId,
        email,
        username,
        displayName: dto.displayName,
        passwordHash,
      },
      select: userPublicSelect,
    });

    return this.createAuthResponse(this.toPublicUser(user));
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const identifier = dto.identifier.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.createAuthResponse(this.toPublicUser({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  private async createAuthResponse(user: PublicUser): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  private toPublicUser(user: {
    id: bigint;
    email: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): PublicUser {
    return {
      ...user,
      id: user.id.toString(),
    };
  }
}
