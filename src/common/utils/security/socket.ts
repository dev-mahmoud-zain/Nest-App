import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export const getSocketAuth = (client: Socket): string => {
  const authorization =
    client.handshake.auth.authorization ??
    client.handshake.headers.authorization;

  if (!authorization) {
    throw new WsException("Missing Authorization")
  }

  return authorization;
};