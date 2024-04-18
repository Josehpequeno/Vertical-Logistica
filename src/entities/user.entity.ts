import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class User {
  @PrimaryColumn({ unique: true })
  id: number;

  @Column({ length: 45 })
  name: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
