import { supabase } from '../lib/supabase';
import { Product } from '../types';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleProductAvailability(
  id: string,
  isAvailable: boolean
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', id);

  if (error) throw error;
}
