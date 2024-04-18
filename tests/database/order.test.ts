import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { Product } from "../../src/entities/product.entity";
import { Order } from "../../src/entities/order.entity";

const MOCK_PRODUCT = {
	id: 1,
	value: 12.78
};

const MOCK_ORDER = {
  id: 1,
  total: 12.78,
  date: "20201201",
  product_id: 1,
  products: [] as Product[]
};

beforeAll( async () => {
	await AppDataSource.initialize();
	await AppDataSource.manager.insert(Product, MOCK_PRODUCT);
});

afterAll( async () => {
  await AppDataSource.manager.delete(Product, MOCK_PRODUCT.id);
	await AppDataSource.close();
});

describe("Teste com pedidos", () => {
  it("criar pedido", async () => {
    try {
      const product = await AppDataSource.manager.findOneByOrFail(Product, {
          id: MOCK_ORDER.product_id
      });
      expect(product).not.toBeNull();
      MOCK_ORDER.products.push(product);

      const order = await AppDataSource.manager.insert(Order, MOCK_ORDER);
      expect(order).not.toBeNull();
    } catch (error) {
      throw new Error(`Erro ao criar pedido no banco de dados: ${error}`);
    }
  });

  it("deleta pedido", async () => {
      try {
        const orderDelete = await AppDataSource.manager.delete(Order, MOCK_ORDER.id);
        expect(orderDelete.affected).toBe(1);
      } catch (error) {
        throw new Error(`Erro ao remover pedido no banco de dados: ${error}`);
      }
    });
});
