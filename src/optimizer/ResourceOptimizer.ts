import { AutoLoadPerfOptions, ResourceHint, PageConfig } from '../types';
import { DEFAULT_OPTIONS } from '../constants';
import { HTMLProcessor } from '../utils/htmlProcessor';
import { Cache } from '../utils/cache';

export class ResourceOptimizer {
  private options: AutoLoadPerfOptions;
  private topDomains: Array<{ domain: string; count: number }> = [];
  private cache: Cache | null = null;

  constructor(options: Partial<AutoLoadPerfOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (this.options.cache?.enabled) {
      this.cache = new Cache(this.options.cache.maxSize);
    }
  }

  private findMatchingPageConfig(url: string): PageConfig | undefined {
    for (const [pattern, config] of Object.entries(this.options.pages)) {
      if (pattern.startsWith('/')) {
        if (url.endsWith(pattern)) {
          return config;
        }
      } else if (pattern.startsWith('http')) {
        if (url === pattern) {
          return config;
        }
      } else if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(url)) {
          return config;
        }
      } else {
        if (url.includes(pattern)) {
          return config;
        }
      }
    }
    return undefined;
  }

  private getPageConfig(path: string): PageConfig | undefined {
    return this.options.pages[path];
  }

  private generateResourceHints(html: string, currentUrl: string, currentDomain: string): ResourceHint[] {
    const processor = new HTMLProcessor(html, currentDomain);
    const hints: ResourceHint[] = [];
    const preloadedUrls = new Set<string>();
    const pageConfig = this.findMatchingPageConfig(currentUrl);

    // Extract domains first
    this.topDomains = processor.extractDomains();

    if (this.options.preconnect) {
      this.topDomains.forEach(({ domain }) => {
        hints.push({
          url: `https://${domain}`,
          type: 'preconnect',
          crossorigin: true,
        });
      });
    }

    if (this.options.preload) {
      const maxPreloads = this.options.maxPreloads || 5;
      const criticalResources = [
        ...processor.getStylesheetUrls(),
        ...processor.getScriptUrls(),
        ...(pageConfig?.preloadResources || [])
      ];

      for (let i = 0; i < Math.min(criticalResources.length, maxPreloads); i++) {
        const resource = criticalResources[i];
        hints.push({
          url: resource.url,
          type: 'preload',
          as: resource.as,
        });
        preloadedUrls.add(resource.url);
      }
    }

    if (this.options.prefetch) {
      const maxPreloads = this.options.maxPreloads || 5;
      const prefetchUrls = [
        ...processor.getLinkUrls().filter(href => !preloadedUrls.has(href)),
        ...(pageConfig?.prefetchRoutes || []),
        ...(pageConfig?.prefetchResources?.map(r => r.url) || [])
      ];

      for (let i = 0; i < Math.min(prefetchUrls.length, maxPreloads); i++) {
        hints.push({
          url: prefetchUrls[i],
          type: 'prefetch',
        });
      }
    }

    return hints;
  }

  public optimize(html: string, path: string, currentDomain: string): string {
    const pageConfig = this.findMatchingPageConfig(path);
    const processor = new HTMLProcessor(html, currentDomain);
    
    // Check cache if enabled
    if (this.cache && pageConfig?.cache?.enabled !== false && this.options.cache?.enabled) {
      const cached = this.cache.get(html);
      if (cached) {
        return cached;
      }
    }

    // Extract domains and generate hints
    this.topDomains = processor.extractDomains();
    const hints = this.generateResourceHints(html, path, currentDomain);
    
    // Inject resource hints into HTML
    const optimizedHtml = processor.injectResourceHints(hints);

    // Cache the result if enabled
    if (this.cache && pageConfig?.cache?.enabled && this.options.cache?.enabled) {
      this.cache.set(html, optimizedHtml, pageConfig.cache.ttl);
    }

    return optimizedHtml;
  }
} 