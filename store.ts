import { supabase } from '../lib/supabase';
import { StoreSettings } from '../types';

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Store settings not found');

  return data;
}

export async function updateStoreSettings(
  updates: Partial<StoreSettings>
): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('store_settings')
    .update(updates)
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .select()
    .single();

  if (error) throw error;
  return data;
}
