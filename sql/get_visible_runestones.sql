BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT 
        s.id,
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
        m.recent,
        s.slug
      FROM meta_information m
      LEFT JOIN signatures s ON m.signature_id = s.id
      LEFT JOIN material_types mt ON m.materialType_id = mt.id
      LEFT JOIN translation_english te ON te.signature_id = s.id
      LEFT JOIN translation_swedish ts ON ts.signature_id = s.id
      LEFT JOIN normalisation_norse tn ON tn.signature_id = s.id
      LEFT JOIN transliterated_text tt ON tt.signature_id = s.id
      WHERE m.latitude IS NOT NULL 
        AND m.longitude IS NOT NULL
        AND (p_west IS NULL OR (
          m.latitude >= p_south 
          AND m.latitude <= p_north 
          AND m.longitude >= p_west 
          AND m.longitude <= p_east
        ))
      ORDER BY s.id
      LIMIT CASE WHEN p_west IS NOT NULL THEN 15000 END
    ) t
  );
END;