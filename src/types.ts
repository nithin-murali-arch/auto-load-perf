import type { Request, Response as ExpressResponse, NextFunction } from 'express';
import * as cheerio from 'cheerio';

export interface LCPConfig {
  url: string | RegExp;
  selector: string;
  attributes?: Record<string, string>;
  priority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  fetchpriority?: 'high' | 'low' | 'auto';
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
    priority?: 'high' | 'low' | 'auto';
  }>;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
  customTransform?: ($: cheerio.CheerioAPI) => void;
  fcpOptimizations?: {
    criticalStyles?: string[];
  };
}

export interface AutoLoadPerfOptions {
  preconnect?: boolean;
  prefetch?: boolean;
  preload?: boolean;
  priority?: 'auto' | 'high' | 'low';
  maxPreloads?: number;
  cache?: CacheOptions;
  pages?: Record<string, PageConfig>;
  minify?: {
    enabled: boolean;
    options?: {
      collapseWhitespace?: boolean;
      removeComments?: boolean;
      removeRedundantAttributes?: boolean;
      removeScriptTypeAttributes?: boolean;
      removeStyleLinkTypeAttributes?: boolean;
      minifyCSS?: boolean;
      minifyJS?: boolean;
      minifyURLs?: boolean;
      processScripts?: string[];
    };
  };
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

export type ExpressMiddleware = (req: Request, res: ExpressResponse, next: NextFunction) => void;

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