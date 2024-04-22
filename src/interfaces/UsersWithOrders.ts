import { User } from "@prisma/client";
import { OrderWithProducts } from "./OrderWithProducts";

export interface UsersWithOrders extends User {
  orders: OrderWithProducts[];
}