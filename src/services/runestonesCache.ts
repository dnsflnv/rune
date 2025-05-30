import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { sqliteService } from './sqliteService';

interface RunestonesDB extends DBSchema {
    runestones: {
        key: number;
        value: Runestone;
        indexes: {
            'by-coordinates': [number, number];
        };
    };
}

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

class RunestonesCache {
    private db: Promise<IDBPDatabase<RunestonesDB>>;
    private lastUpdate: number = 0;
    private CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year
    private isInitialized = false;
    private cachedBounds: Map<string, [number, number, number, number]> = new Map();

    constructor() {
        this.db = this.initDB();
    }

    private async initDB() {
        return openDB<RunestonesDB>('runestones-cache', 1, {
            upgrade(db) {
                const store = db.createObjectStore('runestones', { keyPath: 'id' });
                store.createIndex('by-coordinates', ['latitude', 'longitude']);
            },
        });
    }

    private async initializeCache() {
        if (this.isInitialized) return;
        // Don't preload data - just mark as initialized
        this.isInitialized = true;
    }

    private boundsKey(bounds: [number, number, number, number]): string {
        return bounds.map(b => b.toFixed(4)).join(',');
    }

    private boundsOverlap(bounds1: [number, number, number, number], bounds2: [number, number, number, number]): boolean {
        const [w1, s1, e1, n1] = bounds1;
        const [w2, s2, e2, n2] = bounds2;
        
        return !(e1 < w2 || w1 > e2 || n1 < s2 || s1 > n2);
    }

    async getRunestones(bounds: [number, number, number, number]): Promise<Runestone[]> {
        const db = await this.db;
        const key = this.boundsKey(bounds);
        
        // Check if we have data for similar bounds
        for (const [cachedKey, cachedBounds] of this.cachedBounds.entries()) {
            if (this.boundsOverlap(bounds, cachedBounds)) {
                console.log('Using overlapping cached bounds');
                const allStones = await db.getAll('runestones');
                return this.filterByBounds(allStones, bounds);
            }
        }

        // If no cache hit, load from SQLite
        console.log('No cache hit, loading from SQLite');
        const data = await sqliteService.getRunestones(bounds);
        await this.updateCache(data);
        this.cachedBounds.set(key, bounds);
        
        return data;
    }

    private filterByBounds(stones: Runestone[], bounds: [number, number, number, number]): Runestone[] {
        const [west, south, east, north] = bounds;
        return stones.filter(stone => 
            stone.latitude >= south &&
            stone.latitude <= north &&
            stone.longitude >= west &&
            stone.longitude <= east
        );
    }

    async updateCache(runestones: Runestone[]) {
        const db = await this.db;
        const tx = db.transaction('runestones', 'readwrite');

        await Promise.all([
            ...runestones.map(stone => tx.store.put(stone)),
            tx.done
        ]);

        this.lastUpdate = Date.now();
    }

    async clearCache() {
        const db = await this.db;
        await db.clear('runestones');
        this.lastUpdate = 0;
        this.cachedBounds.clear();
    }

    needsUpdate(): boolean {
        return Date.now() - this.lastUpdate > this.CACHE_DURATION;
    }

    async ensureCacheInitialized() {
        await this.initializeCache();
    }
}

export const runestonesCache = new RunestonesCache(); 