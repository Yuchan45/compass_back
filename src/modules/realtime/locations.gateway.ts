import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdateLocationDto } from '../locations/dto/update-location.dto';
import { LocationsService } from '../locations/locations.service';

type AuthenticatedSocket = Socket & {
  data: {
    user?: AuthenticatedUser;
  };
};

@WebSocketGateway({
  namespace: 'locations',
  cors: {
    origin: '*',
  },
})
export class LocationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly locationsService: LocationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };
      await client.join(this.userRoom(payload.sub));
    } catch {
      client.disconnect(true);
    }
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: UpdateLocationDto,
  ) {
    const user = this.getUser(client);
    const location = await this.locationsService.createLocation(user.id, dto);
    const friendIds = await this.locationsService.getAcceptedFriendIds(user.id);

    for (const friendId of friendIds) {
      this.server.to(this.userRoom(friendId)).emit('friend:location:updated', {
        userId: user.id,
        location,
      });
    }

    return {
      event: 'location:updated',
      data: location,
    };
  }

  @SubscribeMessage('friends:locations')
  async handleFriendsLocations(@ConnectedSocket() client: AuthenticatedSocket) {
    const user = this.getUser(client);

    return {
      event: 'friends:locations',
      data: await this.locationsService.getLatestFriendLocations(user.id),
    };
  }

  private extractToken(client: Socket): string {
    const authToken: unknown = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;

    if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
      return authorizationHeader.slice(7);
    }

    throw new WsException('Missing authentication token.');
  }

  private getUser(client: AuthenticatedSocket): AuthenticatedUser {
    const user: AuthenticatedUser | undefined = client.data.user;

    if (!user) {
      throw new WsException('Unauthorized.');
    }

    return user;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
