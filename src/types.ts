import { Request, Response, NextFunction } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';

export interface LCPConfig {
  url: string | RegExp;
  selector: string;
  attributes?: Record<string, string>;
}

export interface PageConfig {
  lcpConfig?: LCPConfig;
  prefetchRoutes?: string[];
  prefetchResources?: Array<{
    url: string;
    as?: string;
  }>;
  preloadResources?: Array<{
    url: string;
    as: string;
  }>;
  cache?: PageCacheOptions;
}

export interface AutoLoadPerfOptions {
  preconnect: boolean;
  prefetch: boolean;
  preload: boolean;
  priority: 'auto' | 'high' | 'low';
  maxPreloads: number;
  pages: Record<string, PageConfig>;
  cache?: CacheOptions;
}

export interface ResourceHint {
  url: string;
  type: 'preconnect' | 'prefetch' | 'preload';
  as?: string;
  crossorigin?: boolean;
}

export interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  tti?: number;
  resourceCount: number;
  optimizedResources: number;
}

export type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;
export type NextMiddleware = (req: NextApiRequest, res: NextApiResponse, next: () => void) => void;

export interface ResourceAnalyzer {
  analyze(html: string): {
    hints: ResourceHint[];
    metrics: PerformanceMetrics;
  };
}

// Cache-related types
export interface CacheOptions {
  enabled: boolean;
  maxSize?: number;
  ttl?: number;
}

export interface PageCacheOptions {
  enabled: boolean;
  ttl?: number;
}

export interface DomainCount {
  domain: string;
  count: number;
} 