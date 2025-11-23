export interface IProductVariantOption {
  id?: number;
  variationId: number;
  value: string;
}
export interface IProductVariant {
  id?: number;
  name: string;
  categoryId: number;
  options?: string[];
}
