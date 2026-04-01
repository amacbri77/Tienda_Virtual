export interface ProductAttribute {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  descriptionLong?: string;
  collection?: string;
  occasion?: string;
  meaning?: string;
  material?: string;
  detail?: string;
  style?: string;
  attributes: ProductAttribute[];
}