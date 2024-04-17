import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class OrderEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@Column({length: 45})
	nome: string;

	@Column()
	pedidoId: number;

	@Column()
	produtoId: number;

	@Column('decimal', {precision: 12, scale:2})
	valorProduto: number;

	@Column('int')
	dataCompra: number; // formato: yyyymmdd
}
