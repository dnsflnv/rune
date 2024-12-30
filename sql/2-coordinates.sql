-- Add PostGIS geography column if not exists
ALTER TABLE rundata 
ADD COLUMN geom geography(POINT);

-- Convert SWEREF 99 TM coordinates first
UPDATE rundata 
SET geom = CASE 
    WHEN trim(koordinater) ~ '^[67]\d{6}\.\d+$'  -- Added trim() to handle whitespace
    THEN ST_Transform(
        ST_SetSRID(
            ST_MakePoint(
                CAST(split_part(trim(koordinater), '.', 2) AS float),
                CAST(split_part(trim(koordinater), '.', 1) AS float)
            ),
            3006
        ),
        4326
    )::geography
    ELSE NULL
END
WHERE koordinater IS NOT NULL;

-- For WGS84 coordinates with various formats
UPDATE rundata 
SET geom = CASE 
    -- Matches "63.4305 ; 10.4010" format
    WHEN koordinater ~ '^[0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+$'  
    THEN ST_MakePoint(
        CAST(split_part(split_part(koordinater, ';', 2), ' ', 2) AS float), -- longitude
        CAST(split_part(koordinater, ';', 1) AS float)                      -- latitude
    )::geography
    
    -- Matches "(61.839737 ; 8.566154)" format with parentheses
    WHEN koordinater ~ '^\([0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+\)$'
    THEN ST_MakePoint(
        CAST(split_part(split_part(replace(replace(koordinater, '(', ''), ')', ''), ';', 2), ' ', 2) AS float),
        CAST(split_part(replace(replace(koordinater, '(', ''), ')', ''), ';', 1) AS float)
    )::geography
    
    -- Matches "HU 212780 (60.4857213888889 ; -1.61421194444444)" format with grid reference
    WHEN koordinater ~ '.+\([0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+\)$'
    THEN ST_MakePoint(
        CAST(split_part(split_part(substring(koordinater from '\(([^)]+)\)$'), ';', 2), ' ', 2) AS float),
        CAST(split_part(substring(koordinater from '\(([^)]+)\)$'), ';', 1) AS float)
    )::geography
    
    ELSE geom  -- keep existing value if no match
END
WHERE koordinater IS NOT NULL;

-- For WGS84 coordinates with various formats
UPDATE rundata 
SET geom = CASE 
    -- Matches "63.4305 ; 10.4010" format
    WHEN koordinater ~ '^[0-9]{1,2}\.[0-9]+ ; -?[0-9]{1,3}\.[0-9]+$'  
    THEN ST_MakePoint(
        CAST(split_part(split_part(koordinater, ';', 2), ' ', 2) AS float),
        CAST(split_part(koordinater, ';', 1) AS float)
    )::geography
    
    -- Matches "(62.4987; 6.0503)" format (no spaces after semicolon)
    WHEN koordinater ~ '^\([0-9]{1,2}\.[0-9]+;[ ]?-?[0-9]{1,3}\.[0-9]+\)$'
    THEN ST_MakePoint(
        CAST(trim(split_part(replace(replace(koordinater, '(', ''), ')', ''), ';', 2)) AS float),
        CAST(split_part(replace(replace(koordinater, '(', ''), ')', ''), ';', 1) AS float)
    )::geography
    
    -- Keep existing patterns...
    ELSE geom
END
WHERE koordinater IS NOT NULL;