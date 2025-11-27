export interface IProductConfiguration {
  id?: number;
  variation_id: number;
  variation_option_id: number;
  value?: string;
}

export interface IProductItem {
  id?: number;
  sku: string;
  price: number;
  qty_in_stock: number;
  product_image?: string;
  configuration?: IProductConfiguration[];
}

export interface IProduct {
  id?: number;
  category?: {
    id: number;
    category_name: string;
  };
  name: string;
  description: string;
  brand?: string;
  slug?: string;
  image?: string | null;
  categoryId: number;
  items?: IProductItem[];
}
