import { Product } from "./Product";

export interface OrderWithProducts {
  order_id: number;
  total: number;
  date: string;
  products: Product[];
}