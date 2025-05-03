import { createHash } from 'crypto';

interface CacheEntry {
  value: string;
  timestamp: number;
  ttl?: number;
}

export class Cache {
  private store: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.store = new Map();
    this.maxSize = maxSize;
  }

  private hash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictOldest(): void {
    if (this.store.size >= this.maxSize) {
      const oldestKey = Array.from(this.store.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.store.delete(oldestKey);
    }
  }

  get(content: string): string | null {
    const key = this.hash(content);
    const entry = this.store.get(key);
    
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value;
  }

  set(content: string, value: string, ttl?: number): void {
    const key = this.hash(content);
    this.evictOldest();
    
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
} 