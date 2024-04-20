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

      let promises: Promise<any>[] = [];
      const lines: string[] = [];
      rl.on("line", (line: string) => {
        lines.push(line);
      });

      rl.on("error", (err: Error) => {
        throw new Error(err.message);
      });

      rl.on("close", async () => {
        console.log(lines.length);

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

          const productOrderInLine = {
            order_id,
            ...productInLine
          };

          const year = parseInt(order_date.substring(0, 4));
          const month = parseInt(order_date.substring(4, 6)) - 1; // Mês é base 0 (0-11)
          const day = parseInt(order_date.substring(6, 8));

          const orderInLine = {
            order_id,
            date: new Date(year, month, day).toISOString().split("T")[0],
            total: product_value,
            user: {
              connect: { user_id }
            }
          };

          const userInLine = {
            user_id,
            name: user_name
          };

          try {
            await prismaContext.product.upsert({
              where: {
                product_id
              },
              create: productInLine,
              update: { value: product_value }
            });
          } catch (err: any) {
            console.error("line", line);
            throw new Error(err.message);
            //   return reject(err.message);
          }

          try {
            await prismaContext.user.upsert({
              where: {
                user_id
              },
              create: userInLine,
              update: { name: user_name }
            });
          } catch (err: any) {
            console.error("line", line);
            throw new Error(err.message);
            // return reject(err.message);
          }
          const orderExistsInDB = await prismaContext.order.findUnique({
            where: {
              order_id
            },
            include: {
              products: true
            }
          });
          try {
            if (orderExistsInDB) {
              const updatedProducts = [
                ...orderExistsInDB.products,
                productOrderInLine
              ];
              const newTotal = updatedProducts.reduce(
                (total, product) => total + product.value,
                0
              );
              await prismaContext.order.update({
                where: {
                  order_id
                },
                data: {
                  total: newTotal
                }
              });
              await prismaContext.productOrder.create({
                data: productOrderInLine
              });
              // return resolve(null);
            } else {
              await prismaContext.order.create({
                data: orderInLine
              });
              await prismaContext.productOrder.create({
                data: productOrderInLine
              });
              // return resolve(null);
            }
          } catch (err: any) {
            console.error("line", line, "\n->", orderExistsInDB);
            throw new Error(err.message);
            // reject(err.message);
          }
          // return reject();
          //    }));
        }

        // console.log(promises.length);
        // Promise.all(promises).then(() => {
        (async () => {
          for (let line of lines) {
            await processLine(line);
          }
        })();
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        console.log(`Tempo de processamento: ${elapsedTime}ms`);
        res
          .status(200)
          .json({ message: "Conteúdo do arquivo lido com sucesso" });
        // }).catch(err => {
        //   throw new Error(err.mmessage);
        // });
        fs.unlinkSync(filePath);
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
 *     summary: Obter dados
 *     description: Endpoint para obter dados
 *     tags: [List]
 *     responses:
 *       '200':
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 */
router.get("/list", async (req: Request, res: Response) => {
  try {
    const users = await prismaContext.user.findMany();
    res.status(200).json({ users });
  } catch (error: any) {
    console.error("Erro a busca de dados:", error);
    res.status(500).json({ error: "Erro durante o processamento do arquivo" });
  }
});

export default router;
