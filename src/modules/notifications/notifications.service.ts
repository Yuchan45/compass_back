import { Injectable, NotFoundException } from '@nestjs/common';
import { parseId } from '../../common/utils/parse-id';
import { serializeBigInts } from '../../common/utils/serialize-bigint';
import { PrismaService } from '../../database/prisma.service';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';

export type NotificationType =
  | 'FRIEND_REQUEST_RECEIVED'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'MESSAGE_RECEIVED'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'MEETUP_REMINDER'
  | 'ACHIEVEMENT_UNLOCKED';

type CreateNotificationInput = {
  body?: string | null;
  data?: Record<string, unknown>;
  receiverUserId: bigint;
  title: string;
  triggeredByUserId?: bigint | null;
  type: NotificationType;
};

type NotificationRow = {
  id: bigint;
  receiverUserId: bigint;
  triggeredByUserId: bigint | null;
  type: NotificationType;
  title: string;
  body: string | null;
  data: unknown;
  readAt: Date | null;
  createdAt: Date;
};

const DEFAULT_NOTIFICATIONS_LIMIT = 20;
const MAX_NOTIFICATIONS_LIMIT = 100;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput) {
    const dataJson = input.data ? JSON.stringify(input.data) : null;
    const rows = await this.prisma.$queryRaw<NotificationRow[]>`
      INSERT INTO "notifications" (
        "receiver_user_id",
        "triggered_by_user_id",
        "type",
        "title",
        "body",
        "data"
      )
      VALUES (
        ${input.receiverUserId},
        ${input.triggeredByUserId ?? null},
        ${input.type}::notification_type,
        ${input.title},
        ${input.body ?? null},
        ${dataJson}::jsonb
      )
      RETURNING
        "id",
        "receiver_user_id" AS "receiverUserId",
        "triggered_by_user_id" AS "triggeredByUserId",
        "type",
        "title",
        "body",
        "data",
        "read_at" AS "readAt",
        "created_at" AS "createdAt"
    `;

    return serializeBigInts(rows[0]);
  }

  async findMine(userId: string, query: FindNotificationsQueryDto = {}) {
    const receiverUserId = parseId(userId, 'userId');
    const limit = Math.min(
      Number(query.limit ?? DEFAULT_NOTIFICATIONS_LIMIT),
      MAX_NOTIFICATIONS_LIMIT,
    );
    const cursorId = query.cursor ? parseId(query.cursor, 'cursor') : null;
    const unreadOnly = query.unreadOnly === true;

    const rows = await this.prisma.$queryRaw<NotificationRow[]>`
      SELECT
        "id",
        "receiver_user_id" AS "receiverUserId",
        "triggered_by_user_id" AS "triggeredByUserId",
        "type",
        "title",
        "body",
        "data",
        "read_at" AS "readAt",
        "created_at" AS "createdAt"
      FROM "notifications"
      WHERE "receiver_user_id" = ${receiverUserId}
        AND (${cursorId}::bigint IS NULL OR "id" < ${cursorId})
        AND (${unreadOnly}::boolean = false OR "read_at" IS NULL)
      ORDER BY "id" DESC
      LIMIT ${limit + 1}
    `;
    const hasNextPage = rows.length > limit;
    const data = rows.slice(0, limit);

    return serializeBigInts({
      data,
      pagination: {
        hasNextPage,
        limit,
        nextCursor: hasNextPage ? data[data.length - 1]?.id : null,
      },
    });
  }

  async countUnread(userId: string) {
    const receiverUserId = parseId(userId, 'userId');
    const rows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS "count"
      FROM "notifications"
      WHERE "receiver_user_id" = ${receiverUserId}
        AND "read_at" IS NULL
    `;

    return {
      count: Number(rows[0]?.count ?? 0),
    };
  }

  async markRead(userId: string, notificationId: string) {
    const receiverUserId = parseId(userId, 'userId');
    const id = parseId(notificationId, 'id');
    const rows = await this.prisma.$queryRaw<NotificationRow[]>`
      UPDATE "notifications"
      SET "read_at" = COALESCE("read_at", NOW())
      WHERE "id" = ${id}
        AND "receiver_user_id" = ${receiverUserId}
      RETURNING
        "id",
        "receiver_user_id" AS "receiverUserId",
        "triggered_by_user_id" AS "triggeredByUserId",
        "type",
        "title",
        "body",
        "data",
        "read_at" AS "readAt",
        "created_at" AS "createdAt"
    `;

    if (!rows[0]) {
      throw new NotFoundException('Notification not found.');
    }

    return serializeBigInts(rows[0]);
  }

  async markAllRead(userId: string) {
    const receiverUserId = parseId(userId, 'userId');
    const rows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      WITH updated AS (
        UPDATE "notifications"
        SET "read_at" = COALESCE("read_at", NOW())
        WHERE "receiver_user_id" = ${receiverUserId}
          AND "read_at" IS NULL
        RETURNING "id"
      )
      SELECT COUNT(*) AS "count"
      FROM updated
    `;

    return {
      count: Number(rows[0]?.count ?? 0),
    };
  }
}
