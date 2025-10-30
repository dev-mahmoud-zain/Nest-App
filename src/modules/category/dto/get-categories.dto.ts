import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class GetAllCategoriesQuery {

    @Type(() => Number)
    @IsOptional()
    @IsPositive()
    @IsNumber()
    limit: number;

    @Type(() => Number)
    @IsOptional()
    @IsPositive()
    @IsNumber()
    page: number;


    @IsOptional()
    @IsNotEmpty()
    @IsString()
    search: string;


}