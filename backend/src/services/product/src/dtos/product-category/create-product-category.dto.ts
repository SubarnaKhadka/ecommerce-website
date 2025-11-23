import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateProductCategoryDto {
  @IsOptional()
  @IsNumber()
  parentCategoryId?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}
