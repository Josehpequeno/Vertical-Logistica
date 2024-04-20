import "dotenv/config";
import { prismaContext } from "../../src/utils/prismaContext";
import { User } from "@prisma/client";

const MOCK_PRODUCT_ORDER = {
  product_id: 1,
  order_id: 1,
  value: 12.78
};

const MOCK_ORDER = {
  order_id: 1,
  total: 12.78,
  date: new Date(2020, 10, 20).toISOString().split("T")[0],
  user: {
    connect: { user_id: 1 }
  }
};

const MOCK_USER = {
  user_id: 1,
  name: "name"
};

let existsInDB: any = false;
const message = "order_id ou user_id já registrado em banco antes do teste";

beforeAll(async () => {
  existsInDB =
    (await prismaContext.order.findUnique({
      where: {
        order_id: MOCK_ORDER.order_id
      }
    })) ||
    (await prismaContext.user.findUnique({
      where: {
        user_id: MOCK_USER.user_id
      }
    }));
});

describe("Teste com users em banco de dados", () => {
  it("criar user", async () => {
    try {
      if (existsInDB) {
        throw new Error(message);
      }
      const user = await prismaContext.user.create({
        data: MOCK_USER
      });
      const { user_id, name } = user;
      expect(name).toEqual(MOCK_USER.name);
      expect(user_id).toEqual(MOCK_USER.user_id);
    } catch (error: any) {
      console.error(`Erro ao criar user no banco de dados: ${error}`);
      expect(error.message).toBe(message);
    }
  });

  it("criar order", async () => {
    try {
      if (existsInDB) {
        throw new Error(message);
      }
      const order = await prismaContext.order.create({
        data: MOCK_ORDER
      });
      const { order_id, total } = order;
      expect(total).toEqual(MOCK_ORDER.total);
      expect(order_id).toEqual(MOCK_ORDER.order_id);
    } catch (error: any) {
      console.error(`Erro ao criar order no banco de dados: ${error}`);
      expect(error.message).toBe(message);
    }
  });

  it("criar productOrder", async () => {
    try {
      if (existsInDB) {
        throw new Error(message);
      }
      const productOrder = await prismaContext.productOrder.create({
        data: MOCK_PRODUCT_ORDER
      });
      const { order_id, value, product_id } = productOrder;
      expect(value).toEqual(MOCK_PRODUCT_ORDER.value);
      expect(product_id).toEqual(MOCK_PRODUCT_ORDER.product_id);
      expect(order_id).toEqual(MOCK_PRODUCT_ORDER.order_id);
    } catch (error: any) {
      console.error(`Erro ao criar productOrder no banco de dados: ${error}`);
      expect(error.message).toBe(message);
    }
  });

  it("procurar user", async () => {
    try {
      if (existsInDB) {
        throw new Error(message);
      }
      const user = (await prismaContext.user.findUnique({
        where: {
          user_id: MOCK_USER.user_id
        },
        include: {
          orders: {
            include: {
              products: true
            }
          }
        }
      })) as User;
      expect(user).not.toBeNull();
      const { user_id, name } = user;
      expect(name).toEqual(MOCK_USER.name);
      expect(user_id).toEqual(MOCK_USER.user_id);
    } catch (error: any) {
      console.error(`Erro ao criar user no banco de dados: ${error}`);
      expect(error.message).toBe(message);
    }
  });

  it("deleta user", async () => {
    try {
      if (existsInDB) {
        throw new Error(message);
      }
      const userDelete = await prismaContext.user.deleteMany({
        where: { user_id: MOCK_USER.user_id }
      });
      expect(userDelete.count).toBe(1);
    } catch (error: any) {
      console.error(`Erro ao deletar user no banco de dados: ${error}`);
      expect(error.message).toBe(message);
    }
  });
});
