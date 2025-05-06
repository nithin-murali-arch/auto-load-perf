export { createExpressMiddleware } from './middleware/express';
export { ResourceOptimizer } from './optimizer/ResourceOptimizer';
export { HTMLProcessor } from './utils/htmlProcessor';
export type {
  AutoLoadPerfOptions,
  PageConfig,
  ResourceHint,
  LCPConfig,
  PerformanceMetrics,
  CacheOptions,
  PageCacheOptions
} from './types';
export { DEFAULT_OPTIONS } from './constants'; 