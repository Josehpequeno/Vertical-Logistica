import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity()
export class Order {
	@PrimaryColumn({unique: true})
	id: number;

	@Column('decimal', {precision: 2})
	total: number;

	@Column({type: "date"})
	date: Date;

	@ManyToMany((type) => Product)
	@JoinTable()
	products: Product[];	

	@ManyToOne(() => User, (user) => user.orders)
	user: User;	
}
