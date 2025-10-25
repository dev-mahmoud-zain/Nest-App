import { applyDecorators, UseGuards } from "@nestjs/common";
import { RoleEnum } from "../enums";
import { TokenTypeEnum } from "../enums/token.enums";
import { SetAccessRoles } from "./roles.decorator";
import { SetTokenType } from "./token.decorator";
import { AuthenticationGuard } from "../guards/authentication/authentication.guard";
import { AuthorizationGuard } from "../guards/authorization/authorization.guard";

export function Auth(
    accessRoles: RoleEnum[] = [],
    tokenType: TokenTypeEnum = TokenTypeEnum.access
) {

    return applyDecorators(
        SetAccessRoles(accessRoles),
        SetTokenType(tokenType),
        // UseGuards(AuthenticationGuard,AuthorizationGuard)
    )

}