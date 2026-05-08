import { BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';

const publicUser = {
  id: 1n,
  languageId: 10n,
  email: 'user@example.com',
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
  lastSeenAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('UsersService', () => {
  const createService = () => {
    const prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      language: {
        findUnique: jest.fn(),
      },
    };
    const service = new UsersService(prisma as never);

    return {
      service,
      prisma,
    };
  };

  it('updates profile fields for the authenticated user', async () => {
    const { service, prisma } = createService();

    prisma.user.findFirst.mockResolvedValue(null);
    prisma.language.findUnique.mockResolvedValue({ id: 20n });
    prisma.user.update.mockResolvedValue({
      ...publicUser,
      languageId: 20n,
      email: 'new@example.com',
      username: 'new_user',
      displayName: 'New Name',
      avatarUrl: 'https://example.com/avatar.png',
      locationSharingEnabled: false,
    });

    const response = await service.updateProfile('1', {
      email: ' NEW@example.com ',
      username: ' New_User ',
      displayName: ' New Name ',
      avatarUrl: 'https://example.com/avatar.png',
      languageId: '20',
      locationSharingEnabled: false,
    });

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: {
            not: 1n,
          },
          OR: [{ email: 'new@example.com' }, { username: 'new_user' }],
        }),
      }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 1n,
        },
        data: expect.objectContaining({
          email: 'new@example.com',
          username: 'new_user',
          displayName: 'New Name',
          avatarUrl: 'https://example.com/avatar.png',
          languageId: 20n,
          locationSharingEnabled: false,
        }),
      }),
    );
    expect(response).toEqual(
      expect.objectContaining({
        id: '1',
        languageId: '20',
        email: 'new@example.com',
        username: 'new_user',
        locationSharingEnabled: false,
      }),
    );
  });

  it('rejects empty profile updates', async () => {
    const { service } = createService();

    await expect(service.updateProfile('1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate email or username updates', async () => {
    const { service, prisma } = createService();

    prisma.user.findFirst.mockResolvedValue({
      email: 'taken@example.com',
      username: 'taken',
    });

    await expect(
      service.updateProfile('1', {
        email: 'taken@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('deletes the authenticated user profile', async () => {
    const { service, prisma } = createService();

    prisma.user.delete.mockResolvedValue(publicUser);

    await service.deleteProfile('1');

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: {
        id: 1n,
      },
    });
  });
});
