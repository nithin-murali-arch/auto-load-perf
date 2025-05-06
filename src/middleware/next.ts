import { NextResponse } from 'next/server';
import { ResourceOptimizer } from '../optimizer/ResourceOptimizer';
import { AutoLoadPerfOptions } from '../types';

export function createNextMiddleware(options: Partial<AutoLoadPerfOptions> = {}) {
  const optimizer = new ResourceOptimizer(options);

  return async function middleware(request: Request) {
    const response = await fetch(request);
    const html = await response.text();
    const url = new URL(request.url);
    
    const optimizedHtml = optimizer.optimize(html, url.pathname, url.hostname);
    
    return new NextResponse(optimizedHtml, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  };
} 