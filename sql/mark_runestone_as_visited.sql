CREATE OR REPLACE FUNCTION mark_runestone_as_visited(p_signature_id INTEGER, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the runestone exists
  IF NOT EXISTS (SELECT 1 FROM signatures WHERE id = p_signature_id) THEN
    RAISE EXCEPTION 'Runestone with signature_id % does not exist', p_signature_id;
  END IF;

  -- Check if already visited
  IF EXISTS (
    SELECT 1 
    FROM visited 
    WHERE signature_id = p_signature_id 
    AND user_id = p_user_id
  ) THEN
    RETURN FALSE; -- Already visited
  END IF;

  -- Insert the visit record
  INSERT INTO visited (signature_id, user_id)
  VALUES (p_signature_id, p_user_id);

  RETURN TRUE; -- Successfully marked as visited
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to mark runestone as visited: %', SQLERRM;
END;
$$;
