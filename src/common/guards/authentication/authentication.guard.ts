import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenTypeEnum } from 'src/common/enums/token.enums';
import { TokenService } from 'src/common/services/token.service';
import { getSocketAuth } from 'src/common/utils/security/socket';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType =
      this.reflector.getAllAndOverride('tokenType', [context.getHandler()]) ||
      TokenTypeEnum.access;

    let authorization: string = '';
    let req: any;

    switch (context.getType()) {
      case 'http':
        req = context.switchToHttp().getRequest();
        authorization = req.headers.authorization;
        break;

      case 'ws':
        req = context.switchToWs().getClient();
        authorization = getSocketAuth(req);
        break;

      // case "rpc":

      //   break;

      default:
        break;
    }

    if (!authorization) {
      throw new ForbiddenException('Missing Authorization Key');
    }

    const { decoded, user } = await this.tokenService.decodeToken({
      authorization,
      tokenType,
    });

    req.credentials = { decoded, user };

    return true;
  }
}
