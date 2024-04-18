import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { Product } from "../../src/entities/product.entity";
import { Order } from "../../src/entities/order.entity";
import { User } from "../../src/entities/user.entity";

const MOCK_PRODUCT = {
	id: 1,
	value: 12.78
};

const MOCK_ORDER = {
  id: 1,
  date: "20201201",
  product_id: 1,
  products: [] as Product[]
};

const MOCK_USER = {
  id: 1,
  name: "Name",
  order_id: 1,
  orders: [] as Order[]
}

beforeAll( async () => {
	await AppDataSource.initialize();
	await AppDataSource.manager.insert(Product, MOCK_PRODUCT);
  const product = await AppDataSource.manager.findOneByOrFail(Product, {
            id: MOCK_ORDER.product_id
        });
	MOCK_ORDER.products.push(product);
  await AppDataSource.manager.insert(Order, MOCK_ORDER);
});

afterAll( async () => {
	await AppDataSource.manager.delete(Product, MOCK_PRODUCT.id);
	await AppDataSource.manager.delete(Order, MOCK_ORDER.id);
	await AppDataSource.close();
});

describe.skip("Teste com user em banco de dados", () => {
  it("criar user", async () => {
    try {
      const order = await AppDataSource.manager.findOneByOrFail(Order, {
          id: MOCK_USER.order_id
      });
      expect(order).not.toBeNull();
      MOCK_USER.orders.push(order);

      const user = await AppDataSource.manager.insert(User, MOCK_USER);
      expect(user).not.toBeNull();
    } catch (error) {
      throw new Error(`Erro ao criar user no banco de dados: ${error}`);
    }
  });

  it("deleta user", async () => {
      try {
        const userDelete = await AppDataSource.manager.delete(User, MOCK_USER.id);
        expect(userDelete.affected).toBe(1);
      } catch (error) {
        throw new Error(`Erro ao remover user no banco de dados: ${error}`);
      }
    });
});
