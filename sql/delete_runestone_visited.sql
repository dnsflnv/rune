CREATE OR REPLACE FUNCTION delete_runestone_visited(p_signature_id INTEGER, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Check if the runestone exists
  IF NOT EXISTS (SELECT 1 FROM signatures WHERE id = p_signature_id) THEN
    RAISE EXCEPTION 'Runestone with signature_id % does not exist', p_signature_id;
  END IF;

  -- Delete the visit record
  DELETE FROM visited 
  WHERE signature_id = p_signature_id 
  AND user_id = p_user_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Return true if a record was deleted, false if no record existed
  RETURN deleted_count > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete runestone visited record: %', SQLERRM;
END;
$$; 