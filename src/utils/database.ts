import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [
    process.env.NODE_ENV === "prod"
      ? "dist/**/*.entity{,.js}"
      : "src/**/*.entity{.ts,.js}"
  ],
  subscribers: [],
  migrations: []
});
