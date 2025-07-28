export interface Runestone {
  id: number;
  signature_text: string;
  found_location: string;
  parish: string;
  district: string;
  municipality: string;
  current_location: string;
  material: string;
  material_type?: string;
  rune_type: string;
  dating: string;
  style: string;
  carver: string;
  latitude: number;
  longitude: number;
  english_translation?: string;
  swedish_translation?: string;
  norse_text?: string;
  transliteration?: string;
  lost: boolean;
  ornamental: boolean;
  recent: boolean;
  visited?: boolean;
  slug?: string;
}

export interface RunestoneFeature {
  type: 'Feature';
  properties: {
    id: number;
    signature_text: string;
    found_location: string;
    parish: string;
    material: string;
    material_type?: string;
    rune_type: string;
    dating: string;
    english_translation?: string;
    swedish_translation?: string;
    norse_text?: string;
    transliteration?: string;
    // Properties for handling overlapping runestones
    overlapping_count?: number;
    original_coordinates?: [number, number];
    visited?: boolean;
    created_at?: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface RunestoneGeoJSON {
  type: 'FeatureCollection';
  features: RunestoneFeature[];
}
