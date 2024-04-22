import { Order } from "@prisma/client";
import { ProductOrderWithoutId } from "../interfaces/ProductOrderWithoutId";

export function ProcessLine(
  line: string,
  usersMap: Map<number, string>,
  productsMap: Map<number, number>,
  ordersTotalMap: Map<number, number>,
  ordersIndexMap: Map<number, number>,
  orders: Order[],
  productsOrder: ProductOrderWithoutId[]
): void {
  const user_id = Number(line.slice(0, 10));
  const user_name = line.slice(10, 55).trim();
  const order_id = Number(line.slice(55, 65));
  const product_id = Number(line.slice(65, 75));
  const product_value = Number(line.slice(75, 87));
  const order_date = line.slice(87, 87 + 8);

  const year = order_date.substring(0, 4);
  const month = order_date.substring(4, 6);
  const day = order_date.substring(6, 8);

  const date = year + "-" + month + "-" + day;

  const orderInLine = {
    order_id,
    date,
    total: product_value,
    user_id
  };

  const productOrderInLine = {
    product_id,
    value: product_value,
    order_id
  };

  productsMap.set(product_id, product_value);
  usersMap.set(user_id, user_name);

  if (ordersIndexMap.has(order_id)) {
    const currentTotal = ordersTotalMap.get(order_id)!;
    const newTotal = parseFloat((currentTotal + product_value).toFixed(2));
    const currentIndex = ordersIndexMap.get(order_id)!;
    ordersTotalMap.set(order_id, newTotal);
    orders[currentIndex!].total = newTotal;
  } else {
    orders.push(orderInLine);
    const total = product_value;
    ordersIndexMap.set(order_id, orders.length - 1);
    ordersTotalMap.set(order_id, total);
  }

  productsOrder.push(productOrderInLine);
}
