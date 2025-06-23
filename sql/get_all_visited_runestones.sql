CREATE OR REPLACE FUNCTION get_all_visited_runestones(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT 
        v.signature_id as id,
        v.created_at
      FROM visited v
      WHERE v.user_id = p_user_id
      ORDER BY v.created_at DESC, v.signature_id
    ) t
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to get visited runestones: %', SQLERRM;
END;
$$;
