export const userPublicSelect = {
  id: true,
  languageId: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  locationSharingEnabled: true,
  language: {
    select: {
      code: true,
      language: true,
    },
  },
  role: {
    select: {
      code: true,
    },
  },
  lastSeenAt: true,
  createdAt: true,
  updatedAt: true,
};
