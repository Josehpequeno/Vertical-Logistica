import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { prismaContext } from "../utils/prismaContext";
import fs from "fs";
import path from "path";
import * as readline from "readline";
import { MultiBar } from "cli-progress";
import { connect } from "http2";

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

const multiBar = new MultiBar({
  format: "{filename} |{bar}|  {percentage}% | {value}/{total} linhas",
  barCompleteChar: "\u001b[32m\u2588\u001b[0m",
  barIncompleteChar: "\u001b[37m\u2591\u001b[0m",
  hideCursor: true
});

const progressBars: Record<string, any> = {};

interface Task {
  filename: string;
  totalLines: number;
}

const initProgressBar = (task: Task) => {
  const { filename, totalLines } = task;
  progressBars[filename] = multiBar.create(totalLines, 0, { filename });
};

const updateProgressBar = (filename: string, value: number) => {
  progressBars[filename].update(value);
};

const stopProgressBars = () => {
  for (const progressBar of Object.values(progressBars)) {
    progressBar.stop();
  }
  multiBar.stop();
};

const tasks: Task[] = [];

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
          // user: {
          //   connectOrCreate: {
          //     where: { user_id: user_id },
          //     create: userInLine
          //   }
          // }
          user_id
        };

        const productOrderInLine = {
          product_id,
          value: product_value,
          // order: {
          //   connectOrCreate: {
          //     where: { order_id: order_id },
          //     create: orderInLine
          //   }
          // }
          order_id
        };

        // const productExists = products.some(
        //   (product) => product.product_id === productInLine.product_id
        // );

        // if (!productExists) {
        products.push(
          prismaContext.product.upsert({
            where: {
              product_id
            },
            create: productInLine,
            update: { value: productInLine.value }
          })
        );
        // }
        // const userExists = users.some(
        //   (user) => user.user_id === userInLine.user_id
        // );

        // if (!userExists) {
        users.push(
          prismaContext.user.upsert({
            where: {
              user_id
            },
            create: userInLine,
            update: { name: userInLine.name }
          })
        );
        // }
        // orders.push(orderInLine);
        let orderInDb = await prismaContext.order.findUnique({
          where: {
            order_id
          }
        });
        const total = orderInDb
          ? orderInDb.total + product_value
          : product_value;
        orders.push(
          prismaContext.order.upsert({
            where: {
              order_id
            },
            create: orderInLine,
            update: {
              total
            }
          })
        );
        // prismaContext.order
        //   .findUnique({
        //     where: {
        //       order_id
        //     }
        //   })
        //   .then((orderExistsInDB) => {
        //     if (orderExistsInDB) {
        //       orders.push(
        //         prismaContext.order.update({
        //           where: {
        //             order_id
        //           },
        //           data: orderInLine
        //         })
        //       );
        //     } else {
        //       orders.push(
        //         prismaContext.order
        //           .create({
        //             data: orderInLine
        //           })
        //           .catch(async (err: any) => {
        //             const existOrderIdInDb = prismaContext.order.findUnique({
        //               where: {
        //                 order_id
        //               }
        //             });
        //             if (!existOrderIdInDb) {
        //               throw new Error(err.message);
        //             }
        //             return prismaContext.order.update({
        //               where: {
        //                 order_id
        //               },
        //               data: orderInLine
        //             });
        //           })
        //       );
        //     }
        //   });
        // orders.push(order);
        // const productOrder = prismaContext.productOrder.create({
        //   data: productOrderInLine
        // });
        productsOrder.push(productOrderInLine);
        // await prismaContext.productOrder.create({
        //   data: productOrderInLine
        // });
        lineProcessed++;
        // console.log(
        //   `linhas processadas arquivo ${filename}: `,
        //   lineProcessed,
        //   "/",
        //   lines.length
        // );
        // updateProgressBar(filename, lineProcessed);
      }
      rl.on("line", (line: string) => {
        if (line.length !== 0) {
          processLine(line);
        }
      });

      rl.on("error", (err: Error) => {
        throw new Error(err.message);
      });

      let lineProcessed = 0;
      rl.on("close", async () => {
        fs.unlinkSync(filePath);
        // tasks.push({ filename, totalLines: lines.length });
        // initProgressBar({ filename, totalLines: lines.length });

        // (async () => {
        //   for (let line of lines) {
        //     await processLine(line);
        //   }
        // })();
        prismaContext.$transaction(async (tx) => {
          prismaContext.$transaction(users);
          prismaContext.$transaction(products);
          prismaContext.$transaction(orders);

          await tx.productOrder.createMany({
            data: productsOrder
          });

          const endTime = Date.now();
          const elapsedTime = endTime - startTime;
          console.log(`Tempo de processamento: ${elapsedTime}ms`);
          res
            .status(200)
            .json({ message: "Conteúdo do arquivo lido com sucesso" });
        });
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
