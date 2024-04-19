import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppDataSource } from "../utils/database";
import { Product } from "../entities/product.entity";
import { ProductOrder } from "../entities/productOrder.entity";
import { Order } from "../entities/order.entity";
import { User } from "../entities/user.entity";
import fs from "fs";
import path from "path";
import * as readline from "readline";

// configurando multer para armazenamento em arquivo
const uploadDirectory = 'uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const currentDate = Date.now().toString();
    cb(null, currentDate + '_' + file.originalname );
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
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    console.error("Arquivo não fornecido");
    return res.status(400).json({ error: "Arquivo não fornecido" });
  }
  try{
    const startTime = Date.now();
    const filename = req.file.filename;
    const filePath = path.join(uploadDirectory, filename);
  
    const rl: readline.Interface = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    })
    
    rl.on("line", async (line: string) => {
      if (line.length === 0){
        return;
      }
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
              
      const orderInLine = {
        order_id,
        date: new Date(year, month, day),
        products: [] as ProductOrder[]
      };

      const userInLine = {
        user_id,
        name: user_name,
        orders: [] as Order[]
      };
      
      await AppDataSource.manager.transaction(async transactionalEntityManager => {
        let product = new Product();
        product.product_id = product_id;
        product.value = product_value;
        await transactionalEntityManager.upsert(Product, [product], ["product_id"]);

        let productOrder = new ProductOrder();
        productOrder.product_id = product_id;
        productOrder.value = product_value;
        productOrder = await transactionalEntityManager.save(productOrder);
        

        let order: Order;
        const orderExistsInDB = await transactionalEntityManager.findOne(Order, {
          where: {
            order_id
          },
          relations: ['products']
        });
        if (!orderExistsInDB) {
          try {
            order = new Order();
            order.order_id = order_id;
            order.date = orderInLine.date;
            orderInLine.products.push(productOrder);
            order.products = orderInLine.products;
            order.total = productOrder.value;
            order = await transactionalEntityManager.save(order);      
          } catch(err: any) {
            console.error("erro acontece aqui", err.message);
            console.error("orderExistsInDB", orderExistsInDB);
            console.error("order_id", order_id);
            const orderExistsInDBAfterIf = await transactionalEntityManager.existsBy(Order, {
                        order_id
            });    
            console.error("orderExistsInDBAfterIf", orderExistsInDBAfterIf);
            throw new Error(err.message);
          }
        } else {
          /*const ordersProductIds = new Set(order?.products.map(product => product.product_id));
          const productExistInOrderproducts = ordersProductIds.has(product_id);
          if(!productExistInOrderproducts) {
            order!.products.push(product);
          } */
          try {
            orderExistsInDB.products.push(productOrder);
            order = await transactionalEntityManager.save(orderExistsInDB);
          } catch (error: any) {
            console.error("erro acontece ao registrar order existente novamente", line, JSON.stringify(orderExistsInDB.products));
            throw new Error(error.message);
          }
        }
      
        const userExistsInDB = await transactionalEntityManager.findOne(User, {
          where: {
            user_id
          },
          relations: ['orders']
        });
        let user: User;
        if(!userExistsInDB) {
          user = new User();
          user.user_id = user_id;
          user.name = user_name;
          userInLine.orders.push(order);
          user.orders = userInLine.orders;
          await transactionalEntityManager.save(user);
        } else {
          const userOrderIds = new Set(userExistsInDB.orders.map(order => order.order_id));
          const orderExistInUserOrders = userOrderIds.has(order_id);
          if(!orderExistInUserOrders) {
            userExistsInDB.orders.push(order);
          } 
          await transactionalEntityManager.save(userExistsInDB);
        }
      });
    });

    rl.on('close', () => {
      fs.unlinkSync(filePath);
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      console.log(`Tempo de processamento: ${elapsedTime}ms`);
      res.status(200).json({ message: "Conteúdo do arquivo lido com sucesso" });
    });
  
    rl.on('error', (err: Error) => {
      throw new Error(err.message);
    });
    
  } catch (error) {
    console.error("Erro durante o processamento do arquivo:", error);
    res.status(500).json({ error: "Erro durante o processamento do arquivo" });
  }
});

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
    const users = await AppDataSource.manager.find(User, {
      relations: ['orders', 'orders.products']
    });

    res.status(200).json({ users });
  } catch (error: any) {
    console.error("Erro a busca de dados:", error);
    res.status(500).json({ error: "Erro durante o processamento do arquivo" });
  }
});

export default router;
