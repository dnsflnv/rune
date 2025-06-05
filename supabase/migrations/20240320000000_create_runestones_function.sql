CREATE OR REPLACE FUNCTION get_runestones(
  p_west double precision DEFAULT NULL,
  p_south double precision DEFAULT NULL,
  p_east double precision DEFAULT NULL,
  p_north double precision DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_query text;
BEGIN
  v_query := '
    SELECT 
      m.id,
      s.signature_text,
      m.found_location,
      m.parish,
      m.district,
      m.municipality,
      m.current_location,
      m.material,
      mt.name as material_type,
      m.rune_type,
      m.dating,
      m.style,
      m.carver,
      m.latitude,
      m.longitude,
      te.value as english_translation,
      ts.value as swedish_translation,
      tn.value as norse_text,
      tt.value as transliteration,
      m.lost,
      m.ornamental,
      m.recent
    FROM meta_information m
    LEFT JOIN signatures s ON m.signature_id = s.id
    LEFT JOIN material_types mt ON m.materialType_id = mt.id
    LEFT JOIN translation_english te ON te.signature_id = s.id
    LEFT JOIN translation_swedish ts ON ts.signature_id = s.id
    LEFT JOIN normalisation_norse tn ON tn.signature_id = s.id
    LEFT JOIN transliterated_text tt ON tt.signature_id = s.id
    WHERE m.latitude IS NOT NULL 
      AND m.longitude IS NOT NULL';

  IF p_west IS NOT NULL AND p_south IS NOT NULL AND p_east IS NOT NULL AND p_north IS NOT NULL THEN
    v_query := v_query || format(' AND m.latitude >= %s AND m.latitude <= %s AND m.longitude >= %s AND m.longitude <= %s',
      p_south, p_north, p_west, p_east);
    v_query := v_query || ' ORDER BY m.id LIMIT 15000';
  ELSE
    v_query := v_query || ' ORDER BY m.id';
  END IF;

  RETURN (SELECT jsonb_agg(row_to_json(t)) FROM (SELECT * FROM meta_information m
    LEFT JOIN signatures s ON m.signature_id = s.id
    LEFT JOIN material_types mt ON m.materialType_id = mt.id
    LEFT JOIN translation_english te ON te.signature_id = s.id
    LEFT JOIN translation_swedish ts ON ts.signature_id = s.id
    LEFT JOIN normalisation_norse tn ON tn.signature_id = s.id
    LEFT JOIN transliterated_text tt ON tt.signature_id = s.id
    WHERE m.latitude IS NOT NULL 
      AND m.longitude IS NOT NULL
      AND (p_west IS NULL OR (m.latitude >= p_south AND m.latitude <= p_north AND m.longitude >= p_west AND m.longitude <= p_east))
    ORDER BY m.id
    LIMIT CASE WHEN p_west IS NOT NULL THEN 15000 END) t);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_runestones(double precision, double precision, double precision, double precision) TO authenticated; 