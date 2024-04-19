import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne, 
  AfterLoad
} from "typeorm";
import { ProductOrder } from "./productOrder.entity";
import { User } from "./user.entity";

@Entity()
export class Order {
  @PrimaryColumn({ unique: true })
  order_id: number;

  @Column({ type: "date" })
  date: Date;

  @Column("decimal", { precision: 12, scale: 2 })
  total: number;

  @ManyToMany(() => ProductOrder)
  @JoinTable()
  products: ProductOrder[];

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @AfterLoad()
  calculateTotal() {
    if(!this.products || this.products.length === 0) {
      this.total = 0;
      return
    }

    this.total = this.products.reduce((total, product) => total + product.value, 0);
  }
}
