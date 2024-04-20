import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import * as swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";
import routes from "./routes/routes";
import { prismaContext } from "./utils/prismaContext";
const app = express();

const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//swagger options
const options: Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "vertical-logistica",
      version: "1.0.0",
      description: "Desafio tecnico",
      host: "localhost:3000",
      basePath: "/",
      consumes: ["application/json", "multipart/form-data"],
      produces: ["application/json"]
    }
  },
  apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc.default(options);

// rota da documentação swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(routes);

app.listen(PORT, async () => {
  try {
    await prismaContext.$connect();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
  } catch (error) {
    console.log("Erro ao estabelecer conexão com banco de dados:", error);
  }
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
