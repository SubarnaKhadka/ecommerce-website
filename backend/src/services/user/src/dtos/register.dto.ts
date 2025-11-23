import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { LoginUserDto } from "./login.dto";

export class CreateUserDto extends LoginUserDto {
  @IsString()
  @IsOptional()
  @MinLength(7)
  @MaxLength(15)
  phone: string;
}
