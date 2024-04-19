import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ProductOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  // tamanho máximo do número com 12 digitos e 2 digitos depois da linha.
  @Column("decimal", { precision: 12, scale: 2 })
  value: number;
}
