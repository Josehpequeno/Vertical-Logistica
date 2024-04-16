import "dotenv/config";
import {DataSourceOptions, DataSource} from "typeorm";
import { OrderEntity } from "../entities";


const connectOptions: DataSourceOptions = {
	type: process.env.DB_TYPE as "postgres",
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	synchronize: true,
	entities: [
		process.env.NODE_ENV === "prod" 
		? "dist/**/*.entity{,.js}"
		: "src/**/*.entity{.ts,.js}"
	],
	migrations: ["src/migrations/*.ts"],
}

export const DB = new DataSource(connectOptions);

export const initDB = async () => {
	const db = await DB.initialize();

	return db;
}

