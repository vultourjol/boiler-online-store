import { db, hasDatabase } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

type IncomingItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, address, comment, items, type } = body as {
      name?: string;
      phone?: string;
      address?: string;
      comment?: string;
      items?: IncomingItem[];
      type?: string;
    };

    if (!name || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Заполните имя, телефон и корзину" },
        { status: 400 }
      );
    }

    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "База данных не подключена" },
        { status: 503 }
      );
    }

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const isReserve = type === "reserve";

    const [order] = await db
      .insert(orders)
      .values({
        name,
        phone,
        address: address ?? "",
        comment: `${isReserve ? "Бронь: " : ""}${comment ?? ""}`,
        total,
        status: isReserve ? "reserve" : "new",
      })
      .returning();

    if (items.length > 0) {
      await db.insert(orderItems).values(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      );
    }

    return NextResponse.json({ orderId: order.id, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Не удалось оформить заказ" }, { status: 500 });
  }
}
