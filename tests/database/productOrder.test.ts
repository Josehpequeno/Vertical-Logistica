import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { ProductOrder } from "../../src/entities/productOrder.entity"

const MOCK_PRODUCT_ORDER = {
  id: 1,
	product_id: 1,
	value: 12.78
}

beforeAll( async () => {
	await AppDataSource.initialize();
});

afterAll( async () => {
	await AppDataSource.close();
});

describe("Teste com productsOrder em banco de dados", () => {
  it("criar productOrder", async () => {
    try {
      let productOrder = new ProductOrder();
      productOrder.product_id = MOCK_PRODUCT_ORDER.product_id;
      productOrder.value = MOCK_PRODUCT_ORDER.value;
      productOrder = await AppDataSource.manager.save(productOrder);
      MOCK_PRODUCT_ORDER.id = productOrder.id;
      expect(productOrder).toEqual(MOCK_PRODUCT_ORDER);
    } catch (error) {
      expect(error).toBeNull();
      console.error(`Erro ao criar produtOrder no banco de dados: ${error}`);
    }
  });

  it("deleta productOrder", async () => {
      try {
        const productOrderDelete = await AppDataSource.manager.delete(ProductOrder, MOCK_PRODUCT_ORDER.id);
        expect(productOrderDelete.affected).toBe(1);
      } catch (error) {
        expect(error).toBeNull();
        console.error(`Erro ao criar produto no banco de dados: ${error}`);
      }
    });
});
