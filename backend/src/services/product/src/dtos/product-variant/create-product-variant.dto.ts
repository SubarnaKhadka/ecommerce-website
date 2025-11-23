import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsString({ each: true })
  @ArrayNotEmpty()
  options: string[];
}

export class CreateproductVariantOptionDto {
  @IsNotEmpty()
  @IsString()
  variationId: number;

  @IsNotEmpty()
  @IsString()
  value: string;
}
