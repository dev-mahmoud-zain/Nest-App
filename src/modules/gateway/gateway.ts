import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import {
  AuthenticationGuard,
  AuthorizationGuard,
  ISocket,
  RoleEnum,
  SetAccessRoles,
  SetTokenType,
  TokenService,
} from 'src/common';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { getSocketAuth } from 'src/common/utils/security/socket';
import { connectedSockets } from 'src/DATABASE';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'public',
})
export class RealTimeGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly tokenService: TokenService) {}

  @WebSocketServer()
  private readonly server: Server;

  afterInit(server: any) {
    console.log('Ral Time GateWay Started Success');
  }

  async handleConnection(client: ISocket) {
    try {
      const authorization = getSocketAuth(client);

      const { user, decoded } = await this.tokenService.decodeToken({
        authorization,
        tokenType: TokenTypeEnum.access,
      });

      client.credentials = { user, decoded };

      const userTaps = connectedSockets.get(user._id.toString()) || [];

      userTaps.push(client.id);

      connectedSockets.set(user._id.toString(), userTaps);
    } catch (error) {
      client.emit('exception', error.message || 'Something Went Wrong');

      client.disconnect();

      console.log(error.message);
    }
  }

  async handleDisconnect(client: ISocket) {
    const userId = client.credentials?.user._id?.toString() as string;

    let remainingTaps =
      connectedSockets.get(userId)?.filter((tap: string) => {
        return tap !== client.id;
      }) || [];

    if (remainingTaps.length) {
      connectedSockets.set(userId, remainingTaps);
    } else {
      connectedSockets.delete(userId);
      this.server.emit('offline_user', userId);
    }
  }

  @SetAccessRoles([RoleEnum.admin, RoleEnum.user])
  @SetTokenType(TokenTypeEnum.access)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SubscribeMessage('change_product_stock')
  changeProductStock(products: { productId: Types.ObjectId; stock: Number }[]) {
    this.server.emit('change_product_stock', products);
  }
}