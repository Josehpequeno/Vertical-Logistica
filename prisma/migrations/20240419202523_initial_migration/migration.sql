-- CreateTable
CREATE TABLE "products" (
    "product_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_orders" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "product_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" INTEGER NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_id_pkey" ON "products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "productorder_id_pkey" ON "product_orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_id_pkey" ON "orders"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_pkey" ON "users"("user_id");

-- AddForeignKey
ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
