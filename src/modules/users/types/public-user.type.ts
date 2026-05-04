export interface PublicUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roleCode: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
