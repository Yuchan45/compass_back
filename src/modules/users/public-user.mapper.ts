import type { PublicUser } from './types/public-user.type';

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
    roleCode: user.role.code,
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
