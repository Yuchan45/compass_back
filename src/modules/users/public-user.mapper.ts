import { PublicUser } from './types/public-user.type';

type UserWithRoleCode = {
  id: bigint;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: {
    code: string;
  };
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapToPublicUser(user: UserWithRoleCode): PublicUser {
  return {
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    roleCode: user.role.code,
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
