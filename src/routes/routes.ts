import express, { Request, Response } from "express";
import { prismaContext } from "../utils/prismaContext";
import fs from "fs";
import path from "path";
import * as readline from "readline";
import { Order } from "@prisma/client";
import { ProcessLine } from "../utils/ProcessLine";
import { ProductOrderWithoutId } from "../interfaces/ProductOrderWithoutId";
import { UsersWithOrders } from "../interfaces/UsersWithOrders";
import { upload, uploadDirectory } from "../utils/multerConfig";

const router = express.Router();

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
      const productsMap: Map<number, number> = new Map();
      const ordersTotalMap: Map<number, number> = new Map();
      const ordersIndexMap: Map<number, number> = new Map();
      const orders: Order[] = [];
      const productsOrder: ProductOrderWithoutId[] = [];

      rl.on("line", (line: string) => {
        if (line.length !== 0) {
          ProcessLine(
            line,
            usersMap,
            productsMap,
            ordersTotalMap,
            ordersIndexMap,
            orders,
            productsOrder
          );
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
