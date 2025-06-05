import { supabase } from './supabase';
import { Runestone } from '../types';

class SupabaseRunestonesService {
  private static instance: SupabaseRunestonesService;

  private constructor() {}

  public static getInstance(): SupabaseRunestonesService {
    if (!SupabaseRunestonesService.instance) {
      SupabaseRunestonesService.instance = new SupabaseRunestonesService();
    }
    return SupabaseRunestonesService.instance;
  }

  async getRunestones(west?: number, south?: number, east?: number, north?: number): Promise<Runestone[]> {
    const { data, error } = await supabase.rpc('get_runestones', {
      p_west: west,
      p_south: south,
      p_east: east,
      p_north: north,
    });

    if (error) {
      console.error('Error fetching runestones:', error);
      throw error;
    }

    return data || [];
  }
}

export const supabaseRunestones = SupabaseRunestonesService.getInstance();
