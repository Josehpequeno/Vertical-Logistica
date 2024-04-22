import "dotenv/config";
import { prismaContext } from "../../src/utils/prismaContext";

const MOCK_PRODUCT = {
  product_id: 1,
  value: 12.78
};
const MOCK_USER = {
  user_id: 1,
  name: "name"
};

const MOCK_ORDER = {
  order_id: 1,
  total: 12.78,
  date: new Date(2020, 10, 20).toISOString().split("T")[0],
  user_id: MOCK_USER.user_id
};

const MOCK_PRODUCT_ORDER = {
  product_id: 1,
  value: 12.78,
  order_id: MOCK_ORDER.order_id
};

let ID: number;

describe("Teste com as tabelas em banco de dados", () => {
  it("criar product", async () => {
    try {
      const product = await prismaContext.product.create({
        data: MOCK_PRODUCT
      });
      expect(product).toEqual(MOCK_PRODUCT);
    } catch (error) {
      console.error(`Erro ao criar produto no banco de dados: ${error}`);
      expect(error).toBeNull();
    }
  });

  it("criar user", async () => {
    try {
      const user = await prismaContext.user.create({
        data: MOCK_USER
      });
      expect(user).toEqual(MOCK_USER);
    } catch (error) {
      console.error(`Erro ao criar user no banco de dados: ${error}`);
      expect(error).toBeNull();
    }
  });

  it("criar Order", async () => {
    try {
      const order = await prismaContext.order.create({
        data: MOCK_ORDER
      });
      expect(order).toEqual(MOCK_ORDER);
    } catch (error) {
      console.error(`Erro ao criar order no banco de dados: ${error}`);
      expect(error).toBeNull();
    }
  });

  it("criar productOrder", async () => {
    try {
      const productOrder = await prismaContext.productOrder.create({
        data: MOCK_PRODUCT_ORDER
      });
      const { id, order_id, value, product_id } = productOrder;
      ID = id;
      expect(value).toEqual(MOCK_PRODUCT_ORDER.value);
      expect(product_id).toEqual(MOCK_PRODUCT_ORDER.product_id);
      expect(order_id).toEqual(MOCK_ORDER.order_id);
    } catch (error) {
      console.error(`Erro ao criar productOrder no banco de dados: ${error}`);
      expect(error).toBeNull();
    }
  });

  it("deleta product", async () => {
    try {
      const productDelete = await prismaContext.product.deleteMany({
        where: { product_id: MOCK_PRODUCT.product_id }
      });
      expect(productDelete.count).toBe(1);
    } catch (error) {
      console.error(`Erro ao deletar product no banco de dados: ${error}`);
      expect(error).toBeNull();
    }
  });

  it("deleta user, order e productOrder em cascata", async () => {
    try {
      const userDelete = await prismaContext.user.deleteMany({
        where: { user_id: MOCK_USER.user_id }
      });
      expect(userDelete.count).toBe(1);
    } catch (error) {
      console.error(`Erro ao deletar user no banco de dados: ${error}`);
      expect(error).toBeNull();
    }
  });
});
