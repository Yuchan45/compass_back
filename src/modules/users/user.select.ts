export const userPublicSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  role: {
    select: {
      code: true,
    },
  },
  lastSeenAt: true,
  createdAt: true,
  updatedAt: true,
};
