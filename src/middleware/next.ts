import { NextResponse } from 'next/server';
import { ResourceOptimizer } from '../optimizer/ResourceOptimizer';
import { AutoLoadPerfOptions } from '../types';

export function createNextMiddleware(options: AutoLoadPerfOptions) {
  const optimizer = new ResourceOptimizer(options);

  return async function middleware(req: Request) {
    const response = await NextResponse.next();
    const contentType = response.headers.get('Content-Type');

    if (contentType?.includes('text/html')) {
      const html = await response.text();
      const currentDomain = new URL(req.url).hostname;
      const path = new URL(req.url).pathname;
      const optimizedHtml = optimizer.optimize(html, path, currentDomain);

      return new NextResponse(optimizedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }

    return response;
  };
} 