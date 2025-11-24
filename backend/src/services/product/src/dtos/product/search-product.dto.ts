import { PaginateDto } from "shared";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class SearchProductDto extends PaginateDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

export class AutoCompleteSearchDto {
  @IsOptional()
  @IsString()
  q?: string;
}
