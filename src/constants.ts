import { AutoLoadPerfOptions } from './types';

export const DEFAULT_OPTIONS: AutoLoadPerfOptions = {
  preconnect: true,
  prefetch: true,
  preload: true,
  priority: 'auto' as const,
  maxPreloads: 5,
  pages: {},
  cache: {
    enabled: false,
    maxSize: 100
  },
  minify: {
    enabled: false,
    options: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      processScripts: ['application/ld+json']
    }
  }
}; 