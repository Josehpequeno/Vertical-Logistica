import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { ProductOrder } from "../../src/entities/productOrder.entity";
import { Order } from "../../src/entities/order.entity";
import { User } from "../../src/entities/user.entity";

const MOCK_PRODUCT_ORDER = {
  id: 1,
	product_id: 1,
	value: 12.78
};

const MOCK_ORDER = {
  order_id: 1,
  date: "20201201",
  product_id: 1,
  total: MOCK_PRODUCT_ORDER.value,
  products: [] as ProductOrder[]
};

const MOCK_USER = {
  user_id: 1,
  name: "Name",
  order_id: 1,
  orders: [] as Order[]
}

let userIdExistsInDB = false;
let orderIdExistsInDB = false;
const message = "user_id e/ou order_id já está registrado no banco de dados antes do teste";

beforeAll( async () => {
	await AppDataSource.initialize();
	userIdExistsInDB = await AppDataSource.manager.existsBy(User, {
	  user_id: MOCK_USER.user_id
	});
	orderIdExistsInDB = await AppDataSource.manager.existsBy(Order, {
		  order_id: MOCK_ORDER.order_id
	});
	if (!userIdExistsInDB && !orderIdExistsInDB) {
    let productOrder = new ProductOrder();
    productOrder.product_id = MOCK_PRODUCT_ORDER.product_id;
    productOrder.value = MOCK_PRODUCT_ORDER.value;
    productOrder = await AppDataSource.manager.save(productOrder);
    MOCK_PRODUCT_ORDER.id = productOrder.id;
    MOCK_ORDER.products.push(productOrder);
    const order = new Order();
    order.order_id = MOCK_ORDER.order_id;
    const year = parseInt(MOCK_ORDER.date.substring(0, 4));
    const month = parseInt(MOCK_ORDER.date.substring(4, 6)) - 1; // Mês é base 0 (0-11)
    const day = parseInt(MOCK_ORDER.date.substring(6, 8));
    order.date = new Date(year, month, day);          
    order.products = MOCK_ORDER.products;
    order.total = MOCK_ORDER.total;
    await AppDataSource.manager.save(order);
  }
});

afterAll( async () => {
  if (!userIdExistsInDB && !orderIdExistsInDB) {
    await AppDataSource.manager.delete(ProductOrder, MOCK_PRODUCT_ORDER.id);
    await AppDataSource.manager.delete(Order, MOCK_ORDER.order_id);
  }
	await AppDataSource.close();
});

describe("Teste com user em banco de dados", () => {
  it("criar user", async () => {
    try {
      if (!userIdExistsInDB && !orderIdExistsInDB) { 
        throw new Error(message);
      }
          
      const order = await AppDataSource.manager.findOneByOrFail(Order, {
         order_id: MOCK_USER.order_id
      });
      MOCK_USER.orders.push(order);
      let user = new User();
      user.user_id = MOCK_USER.user_id;
      user.name = MOCK_USER.name;
      user.orders = MOCK_USER.orders
      user = await AppDataSource.manager.save(user);
      expect(user).toEqual(MOCK_USER);
    } catch (error: any) {
      expect(error.message).toBe(message);
      console.error(`Erro ao criar user no banco de dados: ${error}`);
    }
  });

  it("deleta user", async () => {
      try {
        if (!userIdExistsInDB && !orderIdExistsInDB) { 
          throw new Error(message);
        }    
        const userDelete = await AppDataSource.manager.delete(User, MOCK_USER.user_id);
        expect(userDelete.affected).toBe(1);
      } catch (error: any) {
        expect(error.message).toBe(message);
        console.error(`Erro ao criar user no banco de dados: ${error}`);
      }
    });
});
