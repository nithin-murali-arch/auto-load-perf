import { Cache } from '../utils/cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache(2); // Small size for testing
  });

  test('should store and retrieve values', () => {
    const content = '<html>test</html>';
    const processed = '<html>processed</html>';
    
    cache.set(content, processed);
    expect(cache.get(content)).toBe(processed);
  });

  test('should return null for non-existent keys', () => {
    expect(cache.get('non-existent')).toBeNull();
  });

  test('should handle TTL expiration', () => {
    const content = '<html>test</html>';
    const processed = '<html>processed</html>';
    const ttl = 100; // 100ms TTL
    
    cache.set(content, processed, ttl);
    expect(cache.get(content)).toBe(processed);
    
    // Wait for TTL to expire
    return new Promise(resolve => {
      setTimeout(() => {
        expect(cache.get(content)).toBeNull();
        resolve(undefined);
      }, ttl + 10);
    });
  });

  test('should evict oldest entry when max size is reached', () => {
    const content1 = '<html>test1</html>';
    const content2 = '<html>test2</html>';
    const content3 = '<html>test3</html>';
    
    cache.set(content1, 'processed1');
    cache.set(content2, 'processed2');
    cache.set(content3, 'processed3');
    
    // First entry should be evicted
    expect(cache.get(content1)).toBeNull();
    expect(cache.get(content2)).toBe('processed2');
    expect(cache.get(content3)).toBe('processed3');
  });

  test('should clear all entries', () => {
    const content = '<html>test</html>';
    cache.set(content, 'processed');
    expect(cache.size()).toBe(1);
    
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get(content)).toBeNull();
  });

  test('should handle different content with same hash', () => {
    // This is a theoretical test since SHA-256 collisions are extremely unlikely
    const content1 = '<html>test1</html>';
    const content2 = '<html>test2</html>';
    
    cache.set(content1, 'processed1');
    cache.set(content2, 'processed2');
    
    expect(cache.get(content1)).toBe('processed1');
    expect(cache.get(content2)).toBe('processed2');
  });
}); 