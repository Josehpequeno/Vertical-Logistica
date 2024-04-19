import "dotenv/config";
import { AppDataSource } from "../../src/utils/database";
import { ProductOrder } from "../../src/entities/productOrder.entity";
import { Order } from "../../src/entities/order.entity";

const MOCK_PRODUCT_ORDER = {
  id: 1,
	product_id: 1,
	value: 12.78
};

const MOCK_ORDER = {
  order_id: 1,
  date: "20201201",
  product_id: 1,
  products: [] as ProductOrder[]
};


let orderIdExistsInDB = false;
const message = "order_id já está registrado no banco de dados antes do teste";

beforeAll( async () => {
	await AppDataSource.initialize();
	orderIdExistsInDB = await AppDataSource.manager.existsBy(Order, {
         order_id: MOCK_ORDER.order_id
  });
  if(!orderIdExistsInDB){
    let productOrder = new ProductOrder();
    productOrder.product_id = MOCK_PRODUCT_ORDER.product_id;
    productOrder.value = MOCK_PRODUCT_ORDER.value;
    productOrder = await AppDataSource.manager.save(productOrder);
    MOCK_PRODUCT_ORDER.id = productOrder.id;
	}
});

afterAll( async () => {
  if(!orderIdExistsInDB){
    await AppDataSource.manager.delete(ProductOrder, MOCK_PRODUCT_ORDER.id);
  }
	await AppDataSource.close();
});

describe("Teste Order em banco de dados", () => {
  it("criar order", async () => {
    try {
      if(!orderIdExistsInDB){
        throw new Error(message);
      }
      const productOrder = await AppDataSource.manager.findOneByOrFail(ProductOrder, {
          id: MOCK_PRODUCT_ORDER.id
      });
      expect(productOrder).not.toBeNull();
      MOCK_ORDER.products.push(productOrder);
      let order = new Order();
      order.order_id = MOCK_ORDER.order_id;
      const year = parseInt(MOCK_ORDER.date.substring(0, 4));
      const month = parseInt(MOCK_ORDER.date.substring(4, 6)) - 1; // Mês é base 0 (0-11)
      const day = parseInt(MOCK_ORDER.date.substring(6, 8));
      order.date = new Date(year, month, day);
      order.products = MOCK_ORDER.products;
      order = await AppDataSource.manager.save(order);
      expect(order.order_id).toBe(MOCK_ORDER.order_id);
      expect(order.total).toBe(MOCK_PRODUCT_ORDER.value);
      expect(order.date).toBe( new Date(year, month, day));
      expect(order.products).toEqual(MOCK_ORDER.products);
    } catch (error: any) {
      expect(error.message).toBe(message);
      console.error(`Erro ao criar pedido no banco de dados: ${error}`);
    }
  });

  it("deleta order", async () => {
      try {
        if(!orderIdExistsInDB){
          throw new Error(message);
        }
        const orderDelete = await AppDataSource.manager.delete(Order, MOCK_ORDER.order_id);
        expect(orderDelete.affected).toBe(1);
      } catch (error: any) {
        expect(error.message).toBe(message);
        console.error(`Erro ao criar pedido no banco de dados: ${error}`);
      }
    });
});
