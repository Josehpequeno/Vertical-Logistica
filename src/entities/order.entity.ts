import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Order {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({length: 10})
	userId: number;

	@Column({length: 45})
	nome: string;

	@Column({length: 10})
	pedidoId: number;

	@Column({length: 10})
	produtoId: number;

	@Column('decimal', {precision: 12, scale:2})
	valorProduto: number;

	@Column('int')
	dataCompra: number; // formato: yyyymmdd
}
