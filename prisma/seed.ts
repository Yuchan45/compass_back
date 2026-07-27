import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const defaultLanguage = {
  code: 'EN',
  language: 'English',
};

const roles = [
  {
    code: 'CLIENT_FREE',
    description: 'Basic client',
    role: 'Free Client',
  },
  {
    code: 'ADMIN',
    description: 'Administrator role',
    role: 'admin',
  },
];

const seedUsers = [
  {
    avatarUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Dodgers_at_Nationals_%2853677192000%29_%28cropped%29.jpg/330px-Dodgers_at_Nationals_%2853677192000%29_%28cropped%29.jpg',
    displayName: 'Yuchan',
    email: 'yunaka@gmail.com',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'yuchan45',
  },
  {
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHAjthHpDYQge6U5tTlK60Exl7lvB7Lp3AkR20HHlrTQ&s=10',
    displayName: 'Key',
    email: 'keynaka@gmail.com',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'keynaka',
  },
  {
    avatarUrl: null,
    displayName: 'Yutaka',
    email: 'yutaka@gmail.com',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'yutaka',
  },
  {
    avatarUrl: null,
    displayName: 'Nori',
    email: 'nori@gmail.com',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'nori',
  },
  {
    avatarUrl: null,
    displayName: 'Noe',
    email: 'noe@gmail.com',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'noe',
  },
  {
    avatarUrl:
      'https://www.shutterstock.com/image-vector/admin-avatar-manager-profile-user-260nw-2670442955.jpg',
    displayName: 'Admin',
    email: 'admin@gmail.com',
    password: 'Abcd123!',
    roleCode: 'ADMIN',
    username: 'admin',
  },
  {
    avatarUrl: null,
    displayName: 'Mika Tanaka',
    email: 'mika.tanaka@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'mika_tanaka',
  },
  {
    avatarUrl: null,
    displayName: 'Leo Park',
    email: 'leo.park@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'leo_park',
  },
  {
    avatarUrl: null,
    displayName: 'Sofia Rivera',
    email: 'sofia.rivera@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'sofia_rivera',
  },
  {
    avatarUrl: null,
    displayName: 'Mateo Silva',
    email: 'mateo.silva@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'mateo_silva',
  },
  {
    avatarUrl: null,
    displayName: 'Aiko Nakamura',
    email: 'aiko.nakamura@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'aiko_nakamura',
  },
  {
    avatarUrl: null,
    displayName: 'Lucas Bennett',
    email: 'lucas.bennett@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'lucas_bennett',
  },
  {
    avatarUrl: null,
    displayName: 'Emma Chen',
    email: 'emma.chen@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'emma_chen',
  },
  {
    avatarUrl: null,
    displayName: 'Noah Kim',
    email: 'noah.kim@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'noah_kim',
  },
  {
    avatarUrl: null,
    displayName: 'Valentina Cruz',
    email: 'valentina.cruz@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'valentina_cruz',
  },
  {
    avatarUrl: null,
    displayName: 'Ren Sato',
    email: 'ren.sato@compass.local',
    password: 'Abcd123!',
    roleCode: 'CLIENT_FREE',
    username: 'ren_sato',
  },
];

const acceptedFriendships = [
  ['yunaka@gmail.com', 'keynaka@gmail.com'],
  ['yunaka@gmail.com', 'yutaka@gmail.com'],
  ['yunaka@gmail.com', 'nori@gmail.com'],
  ['yunaka@gmail.com', 'noe@gmail.com'],
  ['yunaka@gmail.com', 'admin@gmail.com'],
  ['keynaka@gmail.com', 'noe@gmail.com'],
  ['yutaka@gmail.com', 'nori@gmail.com'],
] as const;

async function main() {
  const language = await prisma.language.upsert({
    create: defaultLanguage,
    update: {
      language: defaultLanguage.language,
    },
    where: {
      code: defaultLanguage.code,
    },
  });

  const roleByCode = new Map<string, bigint>();

  for (const role of roles) {
    const storedRole = await prisma.role.upsert({
      create: role,
      update: {
        description: role.description,
        role: role.role,
      },
      where: {
        code: role.code,
      },
    });

    roleByCode.set(storedRole.code, storedRole.id);
  }

  const userIdByEmail = new Map<string, bigint>();

  for (const user of seedUsers) {
    const roleId = roleByCode.get(user.roleCode);

    if (!roleId) {
      throw new Error(`Missing role "${user.roleCode}" for ${user.email}.`);
    }

    const passwordHash = await bcrypt.hash(user.password, 12);

    const storedUser = await prisma.user.upsert({
      create: {
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        email: user.email.toLowerCase(),
        languageId: language.id,
        passwordHash,
        roleId,
        username: user.username.toLowerCase(),
      },
      update: {
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        googleSub: null,
        languageId: language.id,
        passwordHash,
        roleId,
        username: user.username.toLowerCase(),
      },
      where: {
        email: user.email.toLowerCase(),
      },
    });

    userIdByEmail.set(storedUser.email, storedUser.id);
  }

  for (const [requesterEmail, addresseeEmail] of acceptedFriendships) {
    const requesterId = userIdByEmail.get(requesterEmail);
    const addresseeId = userIdByEmail.get(addresseeEmail);

    if (!requesterId || !addresseeId) {
      throw new Error(`Missing users for friendship ${requesterEmail} -> ${addresseeEmail}.`);
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { addresseeId, requesterId },
          { addresseeId: requesterId, requesterId: addresseeId },
        ],
      },
    });

    if (existingFriendship) {
      await prisma.friendship.update({
        data: {
          acceptedAt: new Date(),
          status: 'ACCEPTED',
        },
        where: {
          id: existingFriendship.id,
        },
      });
      continue;
    }

    await prisma.friendship.create({
      data: {
        acceptedAt: new Date(),
        addresseeId,
        requesterId,
        status: 'ACCEPTED',
      },
    });
  }

  console.log(`Seeded ${seedUsers.length} users and ${acceptedFriendships.length} friendships.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
