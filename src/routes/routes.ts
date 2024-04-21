import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { prismaContext } from "../utils/prismaContext";
import fs from "fs";
import path from "path";
import * as readline from "readline";

// configurando multer para armazenamento em arquivo
const uploadDirectory = "uploads";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const currentDate = Date.now().toString();
    cb(null, currentDate + "_" + file.originalname);
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Receber arquivo
 *     description: Endpoint para receber um arquivo
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Arquivo recebido com sucesso
 *       '400':
 *         description: Erro ao receber o arquivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      console.error("Arquivo não fornecido");
      return res.status(400).json({ error: "Arquivo não fornecido" });
    }
    try {
      const startTime = Date.now();
      const filename = req.file.filename;
      const filePath = path.join(uploadDirectory, filename);

      const rl: readline.Interface = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });

      // const usersInDb = await prismaContext.user.findMany({});
      // const ordersInDb = await prismaContext.order.findMany({});
      // const productsInDb = await prismaContext.product.findMany({});
      const usersMap = new Map();
      // usersInDb.forEach((item) => {
      //   usersMap.set(item.user_id, item.name);
      // });
      const ordersMap = new Map();
      // ordersInDb.forEach((item) => {
      //   ordersMap.set(item.order_id, item.total);
      // });
      const productsMap = new Map();
      // productsInDb.forEach((item) => {
      //   productsMap.set(item.product_id, item.value);
      // });
      const users: any[] = [];
      const orders: any[] = [];
      const products: any[] = [];
      const productsOrder: any[] = [];
      async function processLine(line: string) {
        const user_id = Number(line.slice(0, 10));
        const user_name = line.slice(10, 55);
        const order_id = Number(line.slice(55, 65));
        const product_id = Number(line.slice(65, 75));
        const product_value = Number(line.slice(75, 87));
        const order_date = line.slice(87, 87 + 8);
        const productInLine = {
          product_id,
          value: product_value
        };

        const year = parseInt(order_date.substring(0, 4));
        const month = parseInt(order_date.substring(4, 6)) - 1; // Mês é base 0 (0-11)
        const day = parseInt(order_date.substring(6, 8));

        const userInLine = {
          user_id,
          name: user_name
        };

        const orderInLine = {
          order_id,
          date: new Date(year, month, day).toISOString().split("T")[0],
          total: product_value,
          user_id
        };

        const productOrderInLine = {
          product_id,
          value: product_value,
          order_id
        };

        if (productsMap.has(product_id)) {
          productsMap.set(product_id, product_value);
        } else {
          products.push(productInLine);
        }

        if (usersMap.has(user_id)) {
          productsMap.set(user_id, user_name);
        } else {
          users.push(userInLine);
        }

        if (ordersMap.has(order_id)) {
          const total = Number(ordersMap.get(order_id)) + product_value;
          ordersMap.set(order_id, total);
        } else {
          orders.push(orderInLine);
        }

        productsOrder.push(productOrderInLine);
      }
      rl.on("line", (line: string) => {
        if (line.length !== 0) {
          processLine(line);
        }
      });

      rl.on("error", (err: Error) => {
        throw new Error(err.message);
      });

      rl.on("close", async () => {
        fs.unlinkSync(filePath);
        console.log(users);
        await prismaContext.$transaction(
          [
            prismaContext.user.createMany({
              data: users
            }),
            prismaContext.product.createMany({
              data: products
            }),
            prismaContext.order.createMany({
              data: orders
            }),
            prismaContext.productOrder.createMany({
              data: productsOrder
            })
          ],
          { isolationLevel: "ReadUncommitted" }
        );

        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        console.log(`Tempo de processamento: ${elapsedTime}ms`);
        res.status(200);
      });
    } catch (error) {
      console.error("Erro durante o processamento do arquivo:", error);
      res
        .status(500)
        .json({ error: "Erro durante o processamento do arquivo" });
    }
  }
);

/**
 * @swagger
 * /list:
 *   get:
 *     summary: Obter dados com paginação e ordenação
 *     description: Endpoint para obter dados com paginação e ordenação
 *     tags: [List]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         description: Índice de início para a paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de resultados a serem retornados
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Campo pelo qual os resultados devem ser ordenados
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Direção da ordenação (ascendente ou descendente)
 *     responses:
 *       '200':
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       '400':
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Erro ao buscar os dados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/list", async (req: Request, res: Response) => {
  try {
    let start = 0;
    let limit = 10;
    let sort = "user_id";
    let sortDirection = "asc";

    if (req.query.start) start = parseInt(req.query.start as string);
    if (req.query.limit) limit = parseInt(req.query.limit as string);
    if (req.query.sort) sort = req.query.sort as string;
    if (
      req.query.sortDirection &&
      ["asc", "desc"].includes(req.query.sortDirection as string)
    ) {
      sortDirection = req.query.sortDirection as string;
    }
    const users = await prismaContext.user.findMany({
      skip: start,
      take: limit,
      orderBy: {
        [sort]: sortDirection
      },
      include: {
        orders: {
          include: {
            products: {
              select: {
                value: true,
                product_id: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({ users });
  } catch (error: any) {
    console.error("Erro ao buscar dados:", error);
    res
      .status(500)
      .json({ error: "Erro durante o processamento da solicitação" });
  }
});

export default router;
