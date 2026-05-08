export interface PublicUser {
  id: string;
  languageId: string;
  languageCode: string;
  languageName: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  locationSharingEnabled: boolean;
  roleCode: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
