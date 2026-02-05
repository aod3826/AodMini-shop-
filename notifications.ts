import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { formatPrice } from '../utils/format';

export async function sendOrderNotification(
  order: Order,
  items: OrderItem[],
  token: string
): Promise<void> {
  const itemsList = items
    .map((item) => `${item.product_name} x${item.quantity} (${formatPrice(item.subtotal)})`)
    .join('\n');

  const message = `
🛒 มีออเดอร์ใหม่!

เลขที่: ${order.order_number}
ยอดรวม: ${formatPrice(order.grand_total)}

รายการสินค้า:
${itemsList}

ที่อยู่จัดส่ง:
${order.delivery_address}

${order.customer_note ? `หมายเหตุ: ${order.customer_note}` : ''}
`.trim();

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
}

export async function sendPaymentNotification(
  orderNumber: string,
  amount: number,
  token: string
): Promise<void> {
  const message = `
💰 การชำระเงินใหม่!

เลขที่ออเดอร์: ${orderNumber}
ยอดเงิน: ${formatPrice(amount)}

กรุณาตรวจสอบสลิปและอัปเดตสถานะ
`.trim();

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
}
