import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne
} from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity()
export class Order {
  @PrimaryColumn({ unique: true })
  order_id: number;

  @Column({ type: "date" })
  date: Date;

  @ManyToMany(() => Product)
  @JoinTable()
  products: Product[];

  @ManyToOne(() => User, (user) => user.orders)
  user: User;
}
