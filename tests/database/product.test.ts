import "dotenv/config";
import { prismaContext } from "../../src/utils/prismaContext";

const MOCK_PRODUCT = {
	product_id: 1,
	value: 12.78
}

let productIdExistsInDB: any = false;
const message = "product_id já registrado em banco antes do teste";

beforeAll( async () => {
	productIdExistsInDB = await prismaContext.product.findUnique({
	  where: {
	    product_id: MOCK_PRODUCT.product_id
	  }
	});
});


describe("Teste com products em banco de dados", () => {
  it("criar product", async () => {
    try {
      if (productIdExistsInDB) {
        throw new Error(message);
      }
      const product = await prismaContext.product.create({
            data: MOCK_PRODUCT
      });
      expect(product).toEqual(MOCK_PRODUCT);
    } catch (error: any) {
      console.error(`Erro ao criar produto no banco de dados: ${error}`);
      expect(error.message).toBe(message);
    }
  });

  it("deleta product", async () => {
      try {
        if (productIdExistsInDB) {
          throw new Error(message);
        }
        const productDelete = await prismaContext.product.deleteMany({
              where: { product_id: MOCK_PRODUCT.product_id }
        });
        expect(productDelete.count).toBe(1);
      } catch (error: any) {
        console.error(`Erro ao deletar product no banco de dados: ${error}`);
        expect(error.message).toBe(message);
      }
    });
});
