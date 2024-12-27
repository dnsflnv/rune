CREATE TABLE newtable (
    signum TEXT,
    plats TEXT,
    socken TEXT,
    harad TEXT,
    kommun TEXT,
    placering TEXT,
    koordinater TEXT,
    urspr_plats TEXT,
    nuv_koord TEXT,
    sockenkod TEXT,
    runtyper TEXT,
    korsform TEXT,
    period TEXT,
    stilgruppering TEXT,
    ristare TEXT,
    materialtyp TEXT,
    material TEXT,
    foremal TEXT,
    ovrigt TEXT,
    alternativt_signum TEXT,
    referens TEXT,
    bildlank TEXT
);

COPY newtable(
    signum,
    plats,
    socken,
    harad,
    kommun,
    placering,
    koordinater,
    urspr_plats,
    nuv_koord,
    sockenkod,
    runtyper,
    korsform,
    period,
    stilgruppering,
    ristare,
    materialtyp,
    material,
    foremal,
    ovrigt,
    alternativt_signum,
    referens,
    bildlank
)
FROM '/Users/Dennis/Downloads/rundata2.csv'
WITH (
    FORMAT csv,
    HEADER true,
    DELIMITER ';',
    ENCODING 'UTF8'
);