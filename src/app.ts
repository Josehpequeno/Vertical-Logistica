import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as swaggerJsdoc from "swagger-jsdoc";
import { Options } from 'swagger-jsdoc';
import routes from './routes/routes';
//import {createConnection} from "typeorm";
import { AppDataSource } from "./utils/database";
const app = express();

//initDB()
//createConnection().then(async connection => {
 // .then(() => {
AppDataSource.initialize()
  .then(async () => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
	 
	const PORT = process.env.PORT || 3000;

	// middlewares
	app.use(express.json());
	app.use(express.urlencoded({extended: true}));

	//swagger options
	const options: Options = {
		swaggerDefinition: {
			openapi: '3.0.0',
			info: {
				title: 'vertical-logistica',
				version: '1.0.0',
				description: 'Desafio tecnico',
				host: "localhost:3000",
				basePath: "/",
				consumes: ['application/json', "multipart/form-data"],
			    produces: ['application/json'],
			}
		},
		apis: ['./src/routes/*.ts']
	} 

	const swaggerSpec = swaggerJsdoc.default(options);

	// rota da documentação swagger
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

	app.use(routes);

	app.listen(PORT, () => {
		console.log(`Servidor rodando na porta ${PORT}`);
	});

  })
.catch((error: Error) => {
  console.error('Erro ao inicializar servidor:', error, ">", process.env.DB_PASSWORD);
});

export default app;
