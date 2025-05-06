import { ResourceOptimizer } from '../optimizer/ResourceOptimizer';
import { AutoLoadPerfOptions } from '../types';

export function createNextMiddleware(options: Partial<AutoLoadPerfOptions> = {}) {
  const optimizer = new ResourceOptimizer(options);

  return async function middleware(request: Request) {
    try {
      // Dynamically import NextResponse only if next is installed
      const { NextResponse } = await import('next/server');
      
      const response = await fetch(request);
      const html = await response.text();
      const url = new URL(request.url);
      
      const optimizedHtml = optimizer.optimize(html, url.pathname, url.hostname);
      
      return new NextResponse(optimizedHtml, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND') {
        throw new Error('Next.js is not installed. Please install next to use the Next.js middleware.');
      }
      throw error;
    }
  };
} 