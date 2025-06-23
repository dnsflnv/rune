CREATE OR REPLACE FUNCTION is_runestone_visited(p_signature_id INTEGER, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the runestone exists
  IF NOT EXISTS (SELECT 1 FROM signatures WHERE id = p_signature_id) THEN
    RAISE EXCEPTION 'Runestone with signature_id % does not exist', p_signature_id;
  END IF;

  -- Check if visited
  RETURN EXISTS (
    SELECT 1 
    FROM visited 
    WHERE signature_id = p_signature_id 
    AND user_id = p_user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to check if runestone is visited: %', SQLERRM;
END;
$$; 