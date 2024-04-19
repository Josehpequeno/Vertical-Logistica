import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { Product } from "../../src/entities/product.entity"

const MOCK_PRODUCT = {
	product_id: 1,
	value: 12.78
}

let productIdExistsInDB = false;
const message = "product_id já registrado em banco antes do teste";

beforeAll( async () => {
	await AppDataSource.initialize();
	productIdExistsInDB = await AppDataSource.manager.existsBy(Product, {
         product_id: MOCK_PRODUCT.product_id
   });
});

afterAll( async () => {
	await AppDataSource.close();
});

describe("Teste com products em banco de dados", () => {
  it("criar product", async () => {
    try {
      if (productIdExistsInDB) {
        throw new Error(message);
      }
      let product = new Product();
      product.product_id = MOCK_PRODUCT.product_id;
      product.value = MOCK_PRODUCT.value;
      product = await AppDataSource.manager.save(product);
      expect(product).toEqual(MOCK_PRODUCT);
    } catch (error: any) {
      expect(error.message).toBe(message);
      console.error(`Erro ao criar produto no banco de dados: ${error}`);
    }
  });

  it("deleta product", async () => {
      try {
        if (productIdExistsInDB) {
          throw new Error(message);
        }
        const productDelete = await AppDataSource.manager.delete(Product, MOCK_PRODUCT.product_id);
        expect(productDelete.affected).toBe(1);
      } catch (error: any) {
        expect(error.message).toBe(message);
        console.error(`Erro ao criar produto no banco de dados: ${error}`);
      }
    });
});
