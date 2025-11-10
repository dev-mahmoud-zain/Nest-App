import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleEnum } from 'src/common/enums';
import { getSocketAuth } from 'src/common/utils/security/socket';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const accessRoles: RoleEnum[] =
      this.reflector.getAllAndOverride('accessRoles', [context.getHandler()]) ||
      [];

    let req: any;
    let role: RoleEnum = RoleEnum.user;

    switch (context.getType()) {
      case 'http':
        req = context.switchToHttp().getRequest();
        role = req.credentials.user.role;
        break;

      case 'ws':
        role = context.switchToWs().getClient().credentials.user.role;
        break;
      // case "rpc":

      //   break;

      default:
        break;
    }

    return accessRoles.includes(role);
  }
}
