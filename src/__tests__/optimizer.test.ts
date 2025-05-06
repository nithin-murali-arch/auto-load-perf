/// <reference types="jest" />
import { ResourceOptimizer } from '../optimizer/ResourceOptimizer';
import { AutoLoadPerfOptions } from '../types';

describe('ResourceOptimizer', () => {
  let optimizer: ResourceOptimizer;
  const defaultOptions: AutoLoadPerfOptions = {
    preload: true,
    prefetch: true,
    preconnect: true,
    priority: 'auto',
    maxPreloads: 5,
    pages: {}
  };

  beforeEach(() => {
    optimizer = new ResourceOptimizer(defaultOptions);
  });

  describe('optimize', () => {
    it('should handle empty HTML', () => {
      const html = '';
      const result = optimizer.optimize(html, '/', 'example.com');
      expect(result).toBe(html);
    });

    it('should inject resource hints', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test</title>
            <link rel="stylesheet" href="style.css">
            <script src="script.js"></script>
          </head>
          <body>
            <img src="image.jpg">
            <a href="page.html">Link</a>
          </body>
        </html>
      `;

      const result = optimizer.optimize(html, '/', 'example.com');
      expect(result).toContain('rel="preload"');
      expect(result).toContain('rel="prefetch"');
      expect(result).toContain('rel="preconnect"');
    });

    it('should respect page config', () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const options: AutoLoadPerfOptions = {
        ...defaultOptions,
        pages: {
          '/test': {
            preloadResources: [
              { url: 'critical.css', as: 'style' },
            ],
            prefetchResources: [
              { url: 'future.js' },
            ],
            prefetchRoutes: ['/about', '/contact'],
          },
        },
      };

      const optimizer = new ResourceOptimizer(options);
      const result = optimizer.optimize(html, '/test', 'example.com');

      expect(result).toContain('critical.css');
      expect(result).toContain('future.js');
      expect(result).toContain('/about');
      expect(result).toContain('/contact');
    });

    it('should handle pattern matching in page config', () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const options: AutoLoadPerfOptions = {
        ...defaultOptions,
        pages: {
          '*.html': {
            preloadResources: [
              { url: 'pattern.css', as: 'style' },
            ],
          },
        },
      };

      const optimizer = new ResourceOptimizer(options);
      const result = optimizer.optimize(html, 'test.html', 'example.com');

      expect(result).toContain('pattern.css');
    });

    it('should respect cache settings when disabled', () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const options: AutoLoadPerfOptions = {
        ...defaultOptions,
        pages: {
          '/test': {
            cache: {
              enabled: false,
              ttl: 3600
            },
          },
        },
        cache: {
          enabled: true,
          maxSize: 100,
          ttl: 3600,
        },
      };

      const optimizer = new ResourceOptimizer(options);
      const result1 = optimizer.optimize(html, '/test', 'example.com');
      const result2 = optimizer.optimize(html, '/test', 'example.com');

      expect(result1).toBe(result2);
    });

    it('should use cache when enabled', () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const options: AutoLoadPerfOptions = {
        ...defaultOptions,
        pages: {
          '/test': {
            cache: {
              enabled: true,
              ttl: 3600
            },
          },
        },
        cache: {
          enabled: true,
          maxSize: 100,
          ttl: 3600,
        },
      };

      const optimizer = new ResourceOptimizer(options);
      const result1 = optimizer.optimize(html, '/test', 'example.com');
      const result2 = optimizer.optimize(html, '/test', 'example.com');

      expect(result1).toBe(result2);
    });
  });
}); 