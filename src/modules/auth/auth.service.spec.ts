import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

const publicUser = {
  id: 1n,
  languageId: 10n,
  email: 'user@gmail.com',
  username: 'user',
  displayName: 'User Name',
  avatarUrl: null,
  locationSharingEnabled: true,
  language: {
    code: 'EN',
    language: 'English',
  },
  role: {
    code: 'CLIENT_FREE',
  },
  settings: {
    colorTheme: 'LIGHT',
  },
  lastSeenAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const googlePayload = {
  iss: 'https://accounts.google.com',
  aud: 'google-client-id',
  sub: 'google-sub-1',
  email: 'User@Gmail.com',
  email_verified: true,
  name: 'User Name',
  picture: 'https://example.com/avatar.png',
  iat: 1,
  exp: 2,
};

describe('AuthService', () => {
  const createService = () => {
    const prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      language: {
        findUnique: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
    };
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('app-jwt'),
    };
    const config = {
      getOrThrow: jest.fn().mockReturnValue('google-client-id'),
    };
    const avatarsService = {
      getPresetUrl: jest
        .fn()
        .mockReturnValue('https://res.cloudinary.com/demo/default-avatar-01.svg'),
    };
    const service = new AuthService(
      prisma as never,
      jwtService as never,
      avatarsService as never,
      config as never,
    );
    const googleClient = {
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => googlePayload,
      }),
    };

    (
      service as unknown as {
        googleClient: typeof googleClient;
      }
    ).googleClient = googleClient;

    return {
      service,
      prisma,
      jwtService,
      avatarsService,
      googleClient,
    };
  };

  it('registers a password user with the selected default avatar preset', async () => {
    const { avatarsService, prisma, service } = createService();

    prisma.user.findFirst.mockResolvedValue(null);
    prisma.language.findUnique.mockResolvedValue({ id: 10n });
    prisma.role.findUnique.mockResolvedValue({ id: 20n });
    prisma.user.create.mockResolvedValue({
      ...publicUser,
      avatarUrl: 'https://res.cloudinary.com/demo/default-avatar-01.svg',
    });

    const response = await service.register({
      avatarPresetId: 'default-avatar-01',
      displayName: 'User Name',
      email: 'User@Gmail.com',
      password: 'Abcd123!',
      username: 'User',
    });

    expect(avatarsService.getPresetUrl).toHaveBeenCalledWith('default-avatar-01');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          avatarUrl: 'https://res.cloudinary.com/demo/default-avatar-01.svg',
          email: 'user@gmail.com',
          settings: {
            create: {},
          },
          username: 'user',
        }),
      }),
    );
    expect(response.user.avatarUrl).toBe('https://res.cloudinary.com/demo/default-avatar-01.svg');
  });

  it('creates a user from a verified Google ID token', async () => {
    const { service, prisma } = createService();

    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.language.findUnique.mockResolvedValue({ id: 10n });
    prisma.role.findUnique.mockResolvedValue({ id: 20n });
    prisma.user.create.mockResolvedValue({
      ...publicUser,
      email: 'user@gmail.com',
      avatarUrl: 'https://example.com/avatar.png',
    });

    const response = await service.googleLogin({ idToken: 'google-id-token' });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          languageId: 10n,
          roleId: 20n,
          email: 'user@gmail.com',
          username: 'user',
          displayName: 'User Name',
          googleSub: 'google-sub-1',
          avatarUrl: 'https://example.com/avatar.png',
          settings: {
            create: {},
          },
        }),
      }),
    );
    expect(response).toEqual(
      expect.objectContaining({
        accessToken: 'app-jwt',
        user: expect.objectContaining({
          id: '1',
          email: 'user@gmail.com',
        }),
      }),
    );
  });

  it('returns an existing user already linked by Google sub', async () => {
    const { service, prisma } = createService();

    prisma.user.findUnique.mockResolvedValueOnce(publicUser);

    const response = await service.googleLogin({ idToken: 'google-id-token' });

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(response.user.id).toBe('1');
  });

  it('links an existing verified email user to Google', async () => {
    const { service, prisma } = createService();
    const existingUser = {
      ...publicUser,
      googleSub: null,
    };

    prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);
    prisma.user.update.mockResolvedValue({
      ...publicUser,
      avatarUrl: 'https://example.com/avatar.png',
    });

    await service.googleLogin({ idToken: 'google-id-token' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 1n,
        },
        data: {
          googleSub: 'google-sub-1',
          avatarUrl: 'https://example.com/avatar.png',
        },
      }),
    );
  });

  it('rejects Google tokens without verified email', async () => {
    const { service, googleClient } = createService();

    googleClient.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        ...googlePayload,
        email_verified: false,
      }),
    });

    await expect(service.googleLogin({ idToken: 'google-id-token' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects password login for Google accounts without local password', async () => {
    const { service, prisma } = createService();

    prisma.user.findFirst.mockResolvedValue({
      ...publicUser,
      googleSub: 'google-sub-1',
      passwordHash: null,
    });

    await expect(
      service.login({
        identifier: 'user@gmail.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
