import express, { Request, Response } from "express";
import multer from "multer";
import { AppDataSource } from "../utils/database";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";
import { User } from "../entities/user.entity";
import { getMetadataArgsStorage } from "typeorm";

// configurando multer para armazenamento em memória
const storage = multer.memoryStorage();
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

  const fileContent = req.file.buffer.toString("utf8");

  const lines = fileContent.split("\n");
  for (let line of lines) {
    //console.log("linha do arquivo", line);
    //console.log("dados:");
    //console.log("id do usuário", line.slice(0, 10));
    const user_id = Number(line.slice(0, 10));
    //console.log("nome", line.slice(10, 10 + 45));
    const user_name = line.slice(10, 55);
    //console.log("id pedido", line.slice(55, 55 + 10));
    const order_id = Number(line.slice(55, 65));
    //console.log("id produto", line.slice(65, 65 + 10));
    const product_id = Number(line.slice(65, 75));
    //console.log("valor do produto", line.slice(75, 75 + 12));
    const product_value = Number(line.slice(75, 87));
    //console.log("data compra", line.slice(87, 87 + 8));
    const order_date = line.slice(87, 87 + 8);
    console.log("line", user_id, user_name, order_id, product_id, product_value,order_date)
    const productInLine = {
      id: product_id,
      value: product_value
    };
    const product = await AppDataSource.manager.upsert(Product, [productInLine], ["id"]);
    const productInDb = await AppDataSource.manager.findOneBy(Product, {
        id: product_id
    }); 
    console.log("Product =>",productInDb);
    const orderInLine = {
      id: order_id,
      date: order_date,
      products: [] as Product[]
    };
    
    const orderExistsInDB = await AppDataSource.manager.existsBy(Order, {
      id: order_id
    });
    let order: Order | null;
    
    if (!orderExistsInDB) {
      orderInLine.products.push(productInDb!);
      await AppDataSource.manager.insert(Order, orderInLine);      
      order = await AppDataSource.manager.findOne(Order, {
        where: {
          id: order_id
        },
        relations: ['products']
      }); 
    } else {
      console.log("Order exist");
      order = await AppDataSource.manager.findOne(Order, {
        where: {
          id: order_id
        },
        relations: ['products']
      });

      let productExistInOrderproducts = false;
      for (let p of order!.products) {
        if (p.id === product_id) {
          productExistInOrderproducts = true;
          break;
        }
      }
      if(!productExistInOrderproducts) {
        order!.products.push(productInDb!);
      } 
      
      await AppDataSource.manager.save(Order, order!);
    }
    console.log("Order =>",order);
  
    const userInLine = {
      id: user_id,
      name: user_name,
      orders: [] as Order[]
    };
    const userExistsInDB = await AppDataSource.manager.existsBy(User, {
      id: user_id
    });
    let user: User | null;
    if(!userExistsInDB) {
      userInLine.orders.push(order!);
      await AppDataSource.manager.insert(User, userInLine);
    } else {
      console.log("User exist");
      user = await AppDataSource.manager.findOne(User, {
        where: {
          id: user_id
        },
        relations: ['orders']
      });
      let orderExistInUserOrders = false;
      for (let o of user!.orders) {
        if (o.id === order_id) {
          orderExistInUserOrders = true;
          break;
        }
      }
      if(!orderExistInUserOrders) {
        user!.orders.push(order!);
      } 
      await AppDataSource.manager.save(User, user!);
      console.log("User =>",user);
    }
    break;
  }

  res.status(200).json({ messsage: "Conteúdo do arquivo lido com sucesso" });
});

/**
 * @swagger
 * /getData:
 *   get:
 *     summary: Obter dados
 *     description: Endpoint para obter dados
 *     tags: [GetData]
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
router.get("/getData", (req: Request, res: Response) => {
  const result = "ok";

  res.json({ result });
});

export default router;
