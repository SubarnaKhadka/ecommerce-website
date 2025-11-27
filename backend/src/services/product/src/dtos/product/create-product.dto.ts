import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from "class-validator";

import { Type } from "class-transformer";

export class CreateProductConfigurationDto {
  @IsNotEmpty()
  @IsNumber()
  variation_id: number;

  @IsNotEmpty()
  @IsNumber()
  variation_option_id: number;
}

export class CreateProductItemDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  qty_in_stock: number;

  @IsOptional()
  @IsString()
  product_image?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductConfigurationDto)
  configuration: CreateProductConfigurationDto[];
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  description: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string | null;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemDto)
  items: CreateProductItemDto[];
}
