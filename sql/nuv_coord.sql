-- Add PostGIS geography column if not exists
ALTER TABLE rundata 
ADD COLUMN nuv_geom geography(POINT);

-- Convert SWEREF 99 TM coordinates first
UPDATE rundata 
SET nuv_geom = CASE 
    WHEN trim(nuv_koord) ~ '^[67]\d{6}\.\d+$'
    THEN ST_Transform(
        ST_SetSRID(
            ST_MakePoint(
                CAST(split_part(trim(nuv_koord), '.', 2) AS float),
                CAST(split_part(trim(nuv_koord), '.', 1) AS float)
            ),
            3006
        ),
        4326
    )::geography
    ELSE NULL
END
WHERE nuv_koord IS NOT NULL;

-- For WGS84 coordinates with various formats
UPDATE rundata 
SET nuv_geom = CASE 
    -- Matches "63.4305 ; 10.4010" format
    WHEN nuv_koord ~ '^[0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+$'  
    THEN ST_MakePoint(
        CAST(split_part(split_part(nuv_koord, ';', 2), ' ', 2) AS float),
        CAST(split_part(nuv_koord, ';', 1) AS float)
    )::geography
    
    -- Matches "(61.839737 ; 8.566154)" format with parentheses
    WHEN nuv_koord ~ '^\([0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+\)$'
    THEN ST_MakePoint(
        CAST(split_part(split_part(replace(replace(nuv_koord, '(', ''), ')', ''), ';', 2), ' ', 2) AS float),
        CAST(split_part(replace(replace(nuv_koord, '(', ''), ')', ''), ';', 1) AS float)
    )::geography
    
    -- Matches "HU 212780 (60.4857213888889 ; -1.61421194444444)" format with grid reference
    WHEN nuv_koord ~ '.+\([0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+\)$'
    THEN ST_MakePoint(
        CAST(split_part(split_part(substring(nuv_koord from '\(([^)]+)\)$'), ';', 2), ' ', 2) AS float),
        CAST(split_part(substring(nuv_koord from '\(([^)]+)\)$'), ';', 1) AS float)
    )::geography
    
    ELSE nuv_geom  -- keep existing value if no match
END
WHERE nuv_koord IS NOT NULL;

-- For WGS84 coordinates with various formats (additional patterns)
UPDATE rundata 
SET nuv_geom = CASE 
    -- Matches "63.4305 ; 10.4010" format
    WHEN nuv_koord ~ '^[0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+$'  
    THEN ST_MakePoint(
        CAST(split_part(split_part(nuv_koord, ';', 2), ' ', 2) AS float),
        CAST(split_part(nuv_koord, ';', 1) AS float)
    )::geography
    
    -- Matches "(62.4987; 6.0503)" format (no spaces after semicolon)
    WHEN nuv_koord ~ '^\([0-9]{1,2}\.[0-9]+;[ ]?-?[0-9]{1,3}\.[0-9]+\)$'
    THEN ST_MakePoint(
        CAST(trim(split_part(replace(replace(nuv_koord, '(', ''), ')', ''), ';', 2)) AS float),
        CAST(split_part(replace(replace(nuv_koord, '(', ''), ')', ''), ';', 1) AS float)
    )::geography
    
    -- Keep existing patterns...
    ELSE nuv_geom
END
WHERE nuv_koord IS NOT NULL;