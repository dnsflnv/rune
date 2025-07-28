CREATE OR REPLACE FUNCTION public.generate_slug(input_string text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  RETURN regexp_replace(
           regexp_replace(
             lower(unaccent("input_string")), -- Lowercase and remove accents in one step
             '[^a-z0-9\\-_]+', '-', 'gi' -- Replace non-alphanumeric characters with hyphens
           ),
           '(^-+|-+$)', '', 'g' -- Remove leading and trailing hyphens
         );
END
$function$;