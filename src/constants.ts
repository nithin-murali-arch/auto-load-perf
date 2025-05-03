import { AutoLoadPerfOptions } from './types';

export const DEFAULT_OPTIONS: AutoLoadPerfOptions = {
  preconnect: true,
  prefetch: true,
  preload: true,
  priority: 'auto',
  maxPreloads: 5,
  pages: {},
  cache: {
    enabled: false,
    maxSize: 100
  }
}; 