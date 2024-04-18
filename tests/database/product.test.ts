import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { Product } from "../../src/entities/product.entity"

const MOCK_PRODUCT = {
	product_id: 1,
	value: 12.78
}

beforeAll( async () => {
	await AppDataSource.initialize();
})

afterAll( async () => {
	await AppDataSource.close();
})

describe.skip("Teste com products em banco de dados", () => {
  it("criar produto", async () => {
    try {
      const product = await AppDataSource.manager.insert(Product, MOCK_PRODUCT);
      expect(product).not.toBeNull();
    } catch (error) {
      throw new Error(`Erro ao criar produto no banco de dados: ${error}`);
    }
  });

  it("deleta produto", async () => {
      try {
        const productDelete = await AppDataSource.manager.delete(Product, MOCK_PRODUCT.product_id);
        expect(productDelete.affected).toBe(1);
      } catch (error) {
        throw new Error(`Erro ao remover produto no banco de dados: ${error}`);
      }
    });
});
