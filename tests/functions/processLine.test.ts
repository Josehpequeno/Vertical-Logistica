import { ProductOrderWithoutId } from "./../../src/interfaces/ProductOrderWithoutId";
import { Order } from "@prisma/client";
import { ProcessLine } from "../../src/utils/ProcessLine";

describe("Teste para função ProcessLine", () => {
  it("Teste com a chamada do ProcessLine", async () => {
    const line =
      "0000000029                            Deetta Cummings V00000003440000000000     1588.8120210703";
    const user_id = 29;
    const user_name = "Deetta Cummings V";
    const order_id = 344;
    const product_id = 0;
    const product_value = 1588.81;
    const date = "2021-07-03";

    const usersMap: Map<number, string> = new Map();
    const productsMap: Map<number, number> = new Map();
    const ordersTotalMap: Map<number, number> = new Map();
    const ordersIndexMap: Map<number, number> = new Map();
    const orders: Order[] = [];
    const productsOrder: ProductOrderWithoutId[] = [];

    ProcessLine(
      line,
      usersMap,
      productsMap,
      ordersTotalMap,
      ordersIndexMap,
      orders,
      productsOrder
    );
    expect(usersMap.has(user_id)).toBe(true);
    expect(usersMap.get(user_id)).toBe(user_name);

    expect(productsMap.has(product_id)).toBe(true);
    expect(productsMap.get(product_id)).toBe(product_value);

    expect(ordersTotalMap.has(order_id)).toBe(true);
    expect(ordersTotalMap.get(order_id)).toBe(product_value);

    expect(ordersIndexMap.has(order_id)).toBe(true);
    expect(ordersIndexMap.get(order_id)).toBe(0);

    expect(orders.length).toBe(1);
    expect(orders[0].date).toBe(date);

    expect(productsOrder.length).toBe(1);
    expect(productsOrder[0].order_id).toBe(order_id);
    expect(productsOrder[0].product_id).toBe(product_id);
    expect(productsOrder[0].value).toBe(product_value);
  });
});
