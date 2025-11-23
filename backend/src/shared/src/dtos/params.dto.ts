import { IsNotEmpty, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class IdParamDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number;
}
