import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Product {
  @PrimaryColumn({ unique: true })
  product_id: number;

  // tamanho máximo do número com 12 digitos e 2 digitos depois da linha.
  @Column("decimal", { precision: 12, scale: 2 })
  value: number;
}
