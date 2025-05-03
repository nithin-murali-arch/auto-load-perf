import { jest, describe, it, expect } from '@jest/globals';
import { autoLoadPerf } from '../src/index';

describe('AutoLoadPerf', () => {
  describe('Express Middleware', () => {
    it('should add resource hints to HTML response', () => {
      const middleware = autoLoadPerf();
      const req = {};
      const res = {
        send: jest.fn(),
      };
      const next = jest.fn();

      middleware(req as any, res as any, next);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/style.css">
            <script src="https://example.com/script.js"></script>
          </head>
          <body>
            <a href="/about">About</a>
          </body>
        </html>
      `;

      res.send(html);

      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('preconnect'));
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('preload'));
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('prefetch'));
      expect(next).toHaveBeenCalled();
    });

    it('should not modify non-HTML responses', () => {
      const middleware = autoLoadPerf();
      const req = {};
      const res = {
        send: jest.fn(),
      };
      const next = jest.fn();

      middleware(req as any, res as any, next);

      const json = { data: 'test' };
      res.send(json);

      expect(res.send).toHaveBeenCalledWith(json);
      expect(next).toHaveBeenCalled();
    });
  });
}); 