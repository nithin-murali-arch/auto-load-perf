/// <reference types="jest" />
import { ResourceOptimizer } from '../optimizer/ResourceOptimizer';
import { AutoLoadPerfOptions } from '../types';

describe('ResourceOptimizer', () => {
  let optimizer: ResourceOptimizer;
  const defaultOptions: AutoLoadPerfOptions = {
    preconnect: true,
    prefetch: true,
    preload: true,
    priority: 'auto',
    maxPreloads: 5,
    pages: {},
    cache: {
      enabled: false,
      maxSize: 100
    }
  };

  beforeEach(() => {
    optimizer = new ResourceOptimizer(defaultOptions);
  });

  test('should optimize HTML with resource hints', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <link rel="stylesheet" href="/styles.css">
          <script src="https://cdn.example.com/script.js"></script>
        </head>
        <body>
          <script src="/app.js"></script>
        </body>
      </html>
    `;

    const optimized = optimizer.optimize(html, '/test', 'example.com');
    expect(optimized).toContain('preload');
    expect(optimized).toContain('preconnect');
  });

  test('should respect page-specific configurations', () => {
    const options: AutoLoadPerfOptions = {
      ...defaultOptions,
      pages: {
        '/home': {
          preloadResources: [
            { url: '/home.css', as: 'style' }
          ]
        }
      }
    };

    optimizer = new ResourceOptimizer(options);
    const html = '<html></html>';
    const optimized = optimizer.optimize(html, '/home', 'example.com');
    expect(optimized).toContain('/home.css');
  });

  test('should use cache when enabled', () => {
    const options: AutoLoadPerfOptions = {
      ...defaultOptions,
      cache: {
        enabled: true,
        maxSize: 10
      },
      pages: {
        '/test': {
          cache: {
            enabled: true,
            ttl: 1000
          }
        }
      }
    };

    optimizer = new ResourceOptimizer(options);
    const html = '<html>test</html>';
    
    // First call should process
    const firstResult = optimizer.optimize(html, '/test', 'example.com');
    
    // Second call should use cache
    const secondResult = optimizer.optimize(html, '/test', 'example.com');
    
    expect(firstResult).toBe(secondResult);
  });

  test('should respect cache TTL', () => {
    const options: AutoLoadPerfOptions = {
      ...defaultOptions,
      cache: {
        enabled: true
      },
      pages: {
        '/test': {
          cache: {
            enabled: true,
            ttl: 100
          }
        }
      }
    };

    optimizer = new ResourceOptimizer(options);
    const html = '<html>test</html>';
    
    // First call should process
    const firstResult = optimizer.optimize(html, '/test', 'example.com');
    
    // Wait for TTL to expire
    return new Promise(resolve => {
      setTimeout(() => {
        // Second call should process again
        const secondResult = optimizer.optimize(html, '/test', 'example.com');
        expect(firstResult).not.toBe(secondResult);
        resolve(undefined);
      }, 150);
    });
  }, 10000);

  test('should handle cache disabled for specific pages', () => {
    const options: AutoLoadPerfOptions = {
      ...defaultOptions,
      cache: {
        enabled: true
      },
      pages: {
        '/test': {
          cache: {
            enabled: false
          }
        }
      }
    };

    optimizer = new ResourceOptimizer(options);
    const html = '<html>test</html>';
    
    // First call should process
    const firstResult = optimizer.optimize(html, '/test', 'example.com');
    
    // Second call should process again (no caching)
    const secondResult = optimizer.optimize(html, '/test', 'example.com');
    
    expect(firstResult).not.toBe(secondResult);
  });

  test('should handle global cache disabled', () => {
    const options: AutoLoadPerfOptions = {
      ...defaultOptions,
      cache: {
        enabled: false
      },
      pages: {
        '/test': {
          cache: {
            enabled: true
          }
        }
      }
    };

    optimizer = new ResourceOptimizer(options);
    const html = '<html>test</html>';
    
    // First call should process
    const firstResult = optimizer.optimize(html, '/test', 'example.com');
    
    // Second call should process again (global cache disabled)
    const secondResult = optimizer.optimize(html, '/test', 'example.com');
    
    expect(firstResult).not.toBe(secondResult);
  });
}); 