import { UserColorTheme } from '@prisma/client';
import type { PublicUser } from './types/public-user.type';

type PublicColorTheme = PublicUser['settings']['colorTheme'];

export type UserWithPublicProfile = {
  id: bigint;
  languageId: bigint;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  locationSharingEnabled: boolean;
  language: {
    code: string;
    language: string;
  };
  role: {
    code: string;
  };
  settings: {
    colorTheme: UserColorTheme;
  } | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapToPublicUser(user: UserWithPublicProfile): PublicUser {
  return {
    id: user.id.toString(),
    languageId: user.languageId.toString(),
    languageCode: user.language.code,
    languageName: user.language.language,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    locationSharingEnabled: user.locationSharingEnabled,
    settings: {
      colorTheme: mapColorTheme(user.settings?.colorTheme),
    },
    roleCode: user.role.code,
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function mapColorTheme(colorTheme: UserColorTheme | undefined): PublicColorTheme {
  return colorTheme === UserColorTheme.DARK ? 'dark' : 'light';
}
