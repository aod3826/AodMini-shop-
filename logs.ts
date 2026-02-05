import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';

export async function fetchActivityLogs(limit = 100): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function createActivityLog(
  action: string,
  description: string,
  level: 'info' | 'warning' | 'error' = 'info',
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('activity_logs').insert({
    action,
    description,
    level,
    metadata,
  });

  if (error) throw error;
}
