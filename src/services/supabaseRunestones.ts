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

  async getVisibleRunestones(west?: number, south?: number, east?: number, north?: number): Promise<Runestone[]> {
    const { data, error } = await supabase.rpc('get_visible_runestones', {
      p_west: west,
      p_south: south,
      p_east: east,
      p_north: north,
    });

    if (error) {
      console.error('Error fetching runestones:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map((row: Runestone) => ({
      id: row.id,
      signature_text: row.signature_text || '',
      found_location: row.found_location || '',
      parish: row.parish || '',
      district: row.district || '',
      municipality: row.municipality || '',
      current_location: row.current_location || '',
      material: row.material || '',
      material_type: row.material_type || '',
      rune_type: row.rune_type || '',
      dating: row.dating || '',
      style: row.style || '',
      carver: row.carver || '',
      latitude: row.latitude,
      longitude: row.longitude,
      english_translation: row.english_translation || '',
      swedish_translation: row.swedish_translation || '',
      norse_text: row.norse_text || '',
      transliteration: row.transliteration || '',
      lost: Boolean(row.lost),
      ornamental: Boolean(row.ornamental),
      recent: Boolean(row.recent),
    }));
  }

  async getAllRunestones(): Promise<Runestone[]> {
    const { data, error } = await supabase.rpc('get_all_runestones');

    if (error) {
      console.error('Error fetching runestones:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map((row: Runestone) => ({
      id: row.id,
      signature_text: row.signature_text || '',
      found_location: row.found_location || '',
      parish: row.parish || '',
      district: row.district || '',
      municipality: row.municipality || '',
      current_location: row.current_location || '',
      material: row.material || '',
      material_type: row.material_type || '',
      rune_type: row.rune_type || '',
      dating: row.dating || '',
      style: row.style || '',
      carver: row.carver || '',
      latitude: row.latitude,
      longitude: row.longitude,
      english_translation: row.english_translation || '',
      swedish_translation: row.swedish_translation || '',
      norse_text: row.norse_text || '',
      transliteration: row.transliteration || '',
      lost: Boolean(row.lost),
      ornamental: Boolean(row.ornamental),
      recent: Boolean(row.recent),
    }));
  }
}

export const supabaseRunestones = SupabaseRunestonesService.getInstance();
