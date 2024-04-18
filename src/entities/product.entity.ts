import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Product {
  @PrimaryColumn({ unique: true })
  id: number;

  @Column("decimal", { precision: 2 })
  value: number;
}
