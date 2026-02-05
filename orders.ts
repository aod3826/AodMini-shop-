import { supabase } from '../lib/supabase';
import { Order, OrderItem, CartItem } from '../types';

export async function createOrder(
  userId: string,
  cartItems: CartItem[],
  totalPrice: number,
  shippingFee: number,
  deliveryAddress: string,
  deliveryLatitude?: number,
  deliveryLongitude?: number,
  distanceKm?: number,
  customerNote?: string
): Promise<{ orderId: string; orderNumber: string }> {
  const items = cartItems.map((item) => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_price: item.product.price,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  const { data, error } = await supabase.rpc('create_order_with_items', {
    p_user_id: userId,
    p_total_price: totalPrice,
    p_shipping_fee: shippingFee,
    p_grand_total: totalPrice + shippingFee,
    p_delivery_address: deliveryAddress,
    p_delivery_latitude: deliveryLatitude || null,
    p_delivery_longitude: deliveryLongitude || null,
    p_distance_km: distanceKm || null,
    p_customer_note: customerNote || null,
    p_items: items,
  });

  if (error) throw error;

  return {
    orderId: data[0].order_id,
    orderNumber: data[0].order_number,
  };
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAllOrders(status?: string): Promise<Order[]> {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function uploadPaymentSlip(
  orderId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${orderId}-${Date.now()}.${fileExt}`;
  const filePath = `payment-slips/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('payments')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('payments').getPublicUrl(filePath);

  return data.publicUrl;
}

export async function verifyPayment(
  orderId: string,
  paymentSlipUrl: string,
  transRef: string,
  verified: boolean
): Promise<void> {
  const { error } = await supabase.rpc('verify_payment', {
    p_order_id: orderId,
    p_payment_slip_url: paymentSlipUrl,
    p_thunder_trans_ref: transRef,
    p_verified: verified,
  });

  if (error) throw error;
}
