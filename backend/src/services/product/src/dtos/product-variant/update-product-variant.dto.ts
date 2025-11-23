import { PartialType, PickType } from "shared";
import { CreateProductVariantDto } from "./create-product-variant.dto";

export class UpdateProductVariantDto extends PartialType(
  PickType(CreateProductVariantDto, ["name", "options"] as const)
) {}
