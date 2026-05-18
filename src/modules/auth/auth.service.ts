import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { DEFAULT_ROLE_CODE } from '../../common/constants/role.constants';
import { PrismaService } from '../../database/prisma.service';
import { parseId } from '../../common/utils/parse-id';
import { mapToPublicUser, type UserWithPublicProfile } from '../users/public-user.mapper';
import { userPublicSelect } from '../users/user.select';
import { PublicUser } from '../users/types/public-user.type';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();
  private readonly googleClientId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.googleClientId = config.getOrThrow<string>('auth.googleClientId');
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already registered.');
    }

    const languageId = await this.resolveLanguageId(dto.languageId);
    const roleId = await this.getDefaultRoleId();
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        languageId,
        roleId,
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
      select: {
        ...userPublicSelect,
        passwordHash: true,
        googleSub: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.passwordHash) {
      if (user.googleSub) {
        throw new ConflictException(
          'This account uses Google Sign-In. Continue with Google or set a password first.',
        );
      }

      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.createAuthResponse(this.toPublicUser(user));
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResponse> {
    const payload = await this.verifyGoogleIdToken(dto.idToken);
    const email = payload.email.toLowerCase();

    const userByGoogleSub = await this.prisma.user.findUnique({
      where: {
        googleSub: payload.sub,
      },
      select: userPublicSelect,
    });

    // User found by google subject
    if (userByGoogleSub) {
      return this.createAuthResponse(this.toPublicUser(userByGoogleSub));
    }

    const userByEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        ...userPublicSelect,
        googleSub: true,
      },
    });

    // User found by email. (Meaning it already existed but not linked to google email.)
    if (userByEmail) {
      if (userByEmail.googleSub && userByEmail.googleSub !== payload.sub) {
        throw new ConflictException('Email is already linked to another Google account.');
      }

      const linkedUser = await this.prisma.user.update({
        where: {
          id: userByEmail.id,
        },
        data: {
          googleSub: payload.sub,
          ...(payload.picture && !userByEmail.avatarUrl ? { avatarUrl: payload.picture } : {}),
        },
        select: userPublicSelect,
      });

      return this.createAuthResponse(this.toPublicUser(linkedUser));
    }

    // User NOT found -> Register
    const languageId = await this.resolveLanguageId();
    const roleId = await this.getDefaultRoleId();
    const username = await this.generateUniqueUsername(email);
    const user = await this.prisma.user.create({
      data: {
        languageId,
        roleId,
        email,
        username,
        displayName: this.getGoogleDisplayName(payload, email),
        googleSub: payload.sub,
        avatarUrl: payload.picture,
      },
      select: userPublicSelect,
    });

    return this.createAuthResponse(this.toPublicUser(user));
  }

  private async verifyGoogleIdToken(idToken: string): Promise<TokenPayload & { email: string }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      const payload = ticket.getPayload();

      if (
        !payload ||
        !payload.sub ||
        !payload.email ||
        payload.email_verified !== true ||
        payload.aud !== this.googleClientId ||
        !['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)
      ) {
        throw new UnauthorizedException('Invalid Google ID token.');
      }

      return payload as TokenPayload & { email: string };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Google ID token.');
    }
  }

  private async resolveLanguageId(languageId?: string): Promise<bigint> {
    if (languageId) {
      return parseId(languageId, 'languageId');
    }

    const defaultLanguage = await this.prisma.language.findUnique({
      where: {
        code: 'EN',
      },
      select: {
        id: true,
      },
    });

    if (!defaultLanguage) {
      throw new ConflictException('Language catalog is not initialized.');
    }

    return defaultLanguage.id;
  }

  private async getDefaultRoleId(): Promise<bigint> {
    const defaultRole = await this.prisma.role.findUnique({
      where: {
        code: DEFAULT_ROLE_CODE,
      },
      select: {
        id: true,
      },
    });

    if (!defaultRole) {
      throw new ConflictException('Roles catalog is not initialized.');
    }

    return defaultRole.id;
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const emailPrefix = email.split('@')[0] ?? 'user';
    const sanitized = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, '_')
      .replace(/\.+/g, '.')
      .replace(/_+/g, '_')
      .replace(/^[._]+|[._]+$/g, '');
    const base = (sanitized.length >= 3 ? sanitized : `user_${sanitized}`).slice(0, 30) || 'user';

    for (let index = 0; index < 100; index += 1) {
      const suffix = index === 0 ? '' : `_${index}`;
      const baseMaxLength = 30 - suffix.length;
      const candidate = `${base.slice(0, baseMaxLength).replace(/_+$/g, '')}${suffix}`;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          username: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existingUser) {
        return candidate;
      }
    }

    return `user_${Date.now().toString(36)}`.slice(0, 30);
  }

  private getGoogleDisplayName(payload: TokenPayload, email: string): string {
    return (payload.name?.trim() || payload.given_name?.trim() || email).slice(0, 80);
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

  private toPublicUser(user: UserWithPublicProfile): PublicUser {
    return mapToPublicUser(user);
  }
}
