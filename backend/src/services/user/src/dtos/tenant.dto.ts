import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class TanentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  domain: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  dedicated_db?: boolean = false;

  @IsOptional()
  @IsString()
  db_name: string;
}
