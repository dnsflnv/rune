import initSqlJs, { Database } from 'sql.js';

interface Runestone {
  id: number;
  signature_text: string;
  found_location: string;
  parish: string;
  district: string;
  municipality: string;
  current_location: string;
  material: string;
  material_type?: string;
  rune_type: string;
  dating: string;
  style: string;
  carver: string;
  latitude: number;
  longitude: number;
  english_translation?: string;
  swedish_translation?: string;
  norse_text?: string;
  transliteration?: string;
  lost: boolean;
  ornamental: boolean;
  recent: boolean;
}

class SQLiteService {
  private db: Database | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize SQL.js
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });

      // Fetch the SQLite database file
      const response = await fetch('/runes.sqlite3');
      const arrayBuffer = await response.arrayBuffer();
      const uintArray = new Uint8Array(arrayBuffer);

      // Create database instance
      this.db = new SQL.Database(uintArray);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  async getRunestones(bounds?: [number, number, number, number]): Promise<Runestone[]> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    let query = `
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
        AND m.longitude IS NOT NULL
    `;

    const params: number[] = [];

    if (bounds) {
      const [west, south, east, north] = bounds;
      query += ` AND m.latitude >= ? AND m.latitude <= ? AND m.longitude >= ? AND m.longitude <= ?`;
      params.push(south, north, west, east);
      
      // Increase LIMIT for bounds queries since clustering can handle more points
      query += ` ORDER BY m.id LIMIT 15000`;
    } else {
      // For "show all" queries, no limit - clustering handles everything
      query += ` ORDER BY m.id`;
    }

    try {
      const start = performance.now();
      const stmt = this.db.prepare(query);
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      const runestones: Runestone[] = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        runestones.push({
          id: row.id as number,
          signature_text: (row.signature_text as string) || '',
          found_location: (row.found_location as string) || '',
          parish: (row.parish as string) || '',
          district: (row.district as string) || '',
          municipality: (row.municipality as string) || '',
          current_location: (row.current_location as string) || '',
          material: (row.material as string) || '',
          material_type: (row.material_type as string) || '',
          rune_type: (row.rune_type as string) || '',
          dating: (row.dating as string) || '',
          style: (row.style as string) || '',
          carver: (row.carver as string) || '',
          latitude: row.latitude as number,
          longitude: row.longitude as number,
          english_translation: (row.english_translation as string) || '',
          swedish_translation: (row.swedish_translation as string) || '',
          norse_text: (row.norse_text as string) || '',
          transliteration: (row.transliteration as string) || '',
          lost: Boolean(row.lost),
          ornamental: Boolean(row.ornamental),
          recent: Boolean(row.recent)
        });
      }
      
      stmt.free();
      const end = performance.now();
      
      return runestones;
    } catch (error) {
      console.error('Error querying runestones:', error);
      throw error;
    }
  }

  // Keep the chunked method but make it more efficient
  async getRunestonesChunked(bounds?: [number, number, number, number], _chunkSize: number = 1000): Promise<Runestone[]> {
    // For now, just use the regular method since we added LIMIT
    return this.getRunestones(bounds);
  }
}

export const sqliteService = new SQLiteService(); 