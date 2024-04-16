import express, { Request, Response} from 'express';
import swaggerUi from 'swagger-ui-express';
import * as swaggerJsdoc from "swagger-jsdoc";
import { Options } from 'swagger-jsdoc';
import routes from './routes/routes.ts';

const app = express();
const PORT = 3000;

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
			description: 'Desafio tecnico'
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

export default app;
