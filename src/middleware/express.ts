import { Request, Response, NextFunction } from 'express';
import { ResourceOptimizer } from '../optimizer/ResourceOptimizer';
import { AutoLoadPerfOptions } from '../types';

export function createExpressMiddleware(options: AutoLoadPerfOptions) {
  const optimizer = new ResourceOptimizer(options);

  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalEnd = res.end;

    res.send = function (body: any) {
      if (typeof body === 'string' && res.get('Content-Type')?.includes('text/html')) {
        const currentDomain = req.hostname;
        const path = req.path;
        body = optimizer.optimize(body, path, currentDomain);
      }
      return originalSend.call(this, body);
    };

    res.end = function (chunk: any, encoding?: any, cb?: any) {
      if (typeof chunk === 'string' && res.get('Content-Type')?.includes('text/html')) {
        const currentDomain = req.hostname;
        const path = req.path;
        chunk = optimizer.optimize(chunk, path, currentDomain);
      }
      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  };
} 