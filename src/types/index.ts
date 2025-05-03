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

// Main types
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

export interface ExpressMiddleware {
  (req: any, res: any, next: () => void): void;
}

export interface NextMiddleware {
  (req: any, res: any, next: () => void): void;
}

export interface LCPConfig {
  selector: string;
  url: string | RegExp;
}

export interface PageConfig {
  lcpConfig?: LCPConfig;
  preloadResources?: Array<{ url: string; as: string }>;
  prefetchRoutes?: string[];
  prefetchResources?: Array<{ url: string; as: string }>;
  cache?: PageCacheOptions;
}

export interface DomainCount {
  domain: string;
  count: number;
} 