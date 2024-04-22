import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { prismaContext } from "../utils/prismaContext";
import fs from "fs";
import path from "path";
import * as readline from "readline";
import { Order, User } from "@prisma/client";

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

interface ProductOrderWithoutId {
  product_id: number;
  value: number;
  order_id: number;
}

interface Product {
  product_id: number;
  value: number;
}

interface OrderWithProducts {
  order_id: number;
  total: number;
  date: string;
  products: Product[];
}
interface UsersWithOrders extends User {
  orders: OrderWithProducts[];
}

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Receber e processar arquivo.
 *     description: Endpoint para receber um arquivo contendo informações de pedidos e produtos, processá-lo e armazenar os dados no banco de dados.
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
 *         description: Arquivo processado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensagem indicando que o arquivo foi processado com sucesso.
 *       '400':
 *         description: Arquivo não fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem indicando que o arquivo não foi fornecido.
 *       '500':
 *         description: Erro interno do servidor durante o processamento do arquivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem indicando o erro interno do servidor durante o processamento do arquivo.
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

      const usersMap: Map<number, string> = new Map();
      const ordersTotalMap: Map<number, number> = new Map();
      const ordersIndexMap: Map<number, number> = new Map();
      const productsMap: Map<number, number> = new Map();
      const orders: Order[] = [];
      const productsOrder: ProductOrderWithoutId[] = [];
      async function processLine(line: string) {
        const user_id = Number(line.slice(0, 10));
        const user_name = line.slice(10, 55).trim();
        const order_id = Number(line.slice(55, 65));
        const product_id = Number(line.slice(65, 75));
        const product_value = Number(line.slice(75, 87));
        const order_date = line.slice(87, 87 + 8);

        const year = parseInt(order_date.substring(0, 4));
        const month = parseInt(order_date.substring(4, 6)) - 1; // Mês é base 0 (0-11)
        const day = parseInt(order_date.substring(6, 8));

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

        productsMap.set(product_id, product_value);
        usersMap.set(user_id, user_name);

        if (ordersIndexMap.has(order_id)) {
          const currentTotal = ordersTotalMap.get(order_id)!;
          const newTotal = parseFloat(
            (currentTotal + product_value).toFixed(2)
          );
          const currentIndex = ordersIndexMap.get(order_id)!;
          ordersTotalMap.set(order_id, newTotal);
          orders[currentIndex!].total = newTotal;
        } else {
          orders.push(orderInLine);
          const total = product_value;
          ordersIndexMap.set(order_id, orders.length - 1);
          ordersTotalMap.set(order_id, total);
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
        try {
          fs.unlinkSync(filePath);
          await prismaContext.$transaction(
            async (tx) => {
              await tx.user.deleteMany({});
              await tx.product.deleteMany({});
              await tx.productOrder.deleteMany({});
              await tx.order.deleteMany({});

              await tx.user.createMany({
                data: Array.from(usersMap, ([user_id, name]) => ({
                  user_id,
                  name
                }))
              });
              await tx.product.createMany({
                data: Array.from(productsMap, ([product_id, value]) => ({
                  product_id,
                  value: Number(value)
                }))
              });
              await tx.order.createMany({
                data: orders
              });
              await tx.productOrder.createMany({
                data: productsOrder
              });
            },
            { isolationLevel: "ReadUncommitted" }
          );

          const endTime = Date.now();
          const elapsedTime = endTime - startTime;
          console.log(`Tempo de processamento: ${elapsedTime}ms`);
          res.status(200).json({ message: "Arquivo processado com sucesso" });
        } catch (error) {
          console.error("Erro durante o processamento do arquivo:", error);
          res
            .status(500)
            .json({ error: "Erro durante o processamento do arquivo" });
        }
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
 *     summary: Obter lista de usuários com detalhes de pedidos e produtos.
 *     description: Endpoint para obter uma lista de usuários juntamente com detalhes de seus pedidos e produtos associados.
 *     tags: [List]
 *     responses:
 *       '200':
 *         description: OK. A lista de usuários com detalhes de pedidos e produtos foi obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   description: Lista de usuários com detalhes de pedidos e produtos.
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       orders:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             order_id:
 *                               type: number
 *                             total:
 *                               type: number
 *                             date:
 *                               type: string
 *                             products:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   product_id:
 *                                     type: number
 *                                   value:
 *                                     type: number
 *
 *       '500':
 *         description: Erro interno do servidor durante o processamento da solicitação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro indicando um problema durante o processamento da solicitação.
 */

router.get("/list", async (req: Request, res: Response) => {
  try {
    const users: UsersWithOrders[] = await prismaContext.user.findMany({
      include: {
        orders: {
          select: {
            order_id: true,
            date: true,
            total: true,
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
