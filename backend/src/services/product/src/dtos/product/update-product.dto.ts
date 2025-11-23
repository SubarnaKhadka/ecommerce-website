import { ArrayNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { PartialType } from "shared";
import {
  CreateProductConfigurationDto,
  CreateProductDto,
  CreateProductItemDto,
} from "./create-product.dto";

export class UpdateProductConfigurationDto extends PartialType(
  CreateProductConfigurationDto
) {}

export class UpdateProductItemDto extends PartialType(CreateProductItemDto) {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductConfigurationDto)
  configuration: UpdateProductConfigurationDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductItemDto)
  items: UpdateProductItemDto[];
}
