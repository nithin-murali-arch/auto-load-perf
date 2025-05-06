import { AutoLoadPerfOptions, ResourceHint, PageConfig } from '../types';
import { DEFAULT_OPTIONS } from '../constants';
import { HTMLProcessor } from '../utils/htmlProcessor';
import { Cache } from '../utils/cache';
import { minify } from 'html-minifier-terser';

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

  private async minifyHtml(html: string): Promise<string> {
    if (!this.options.minify?.enabled) {
      return html;
    }

    const defaultOptions = {
      collapseWhitespace: true,
      removeComments: false,
      removeRedundantAttributes: false,
      removeScriptTypeAttributes: false,
      removeStyleLinkTypeAttributes: false,
      minifyCSS: true,
      minifyJS: false,
      minifyURLs: false,
      // processScripts: ['application/ld+json']
    };

    const minifyOptions = {
      ...defaultOptions,
      ...this.options.minify.options
    };

    try {
      return await minify(html, minifyOptions);
    } catch (error) {
      console.warn('Failed to minify HTML:', error);
      return html;
    }
  }

  private findMatchingPageConfig(url: string): PageConfig | undefined {
    if (!this.options.pages) return undefined;
    
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

  private generateResourceHints(html: string, currentUrl: string, currentDomain: string): ResourceHint[] {
    const processor = new HTMLProcessor(html, currentDomain);
    const hints: ResourceHint[] = [];
    const preloadedUrls = new Set<string>();
    const preconnectedDomains = new Set<string>();
    const prefetchedUrls = new Set<string>();
    const pageConfig = this.findMatchingPageConfig(currentUrl);

    // Get existing resource hints from HTML
    const existingHints = processor.getExistingResourceHints();
    existingHints.preconnectedDomains.forEach(domain => preconnectedDomains.add(domain));
    existingHints.preloadedUrls.forEach(url => preloadedUrls.add(url));
    existingHints.prefetchedUrls.forEach(url => prefetchedUrls.add(url));

    // Extract domains first
    this.topDomains = processor.extractDomains();

    // 1. Preconnect hints first
    if (this.options.preconnect) {
      this.topDomains.forEach(({ domain }) => {
        // Skip if domain is already preconnected in HTML
        if (preconnectedDomains.has(domain)) return;
        
        hints.push({
          url: `https://${domain}`,
          type: 'preconnect',
          crossorigin: true,
        });
        preconnectedDomains.add(domain);
      });
    }

    // 2. Preload hints from configuration
    if (this.options.preload && pageConfig?.preloadResources) {
      pageConfig.preloadResources.forEach(resource => {
        // Skip if already preloaded in HTML
        if (preloadedUrls.has(resource.url)) return;
        
        hints.push({
          url: resource.url,
          type: 'preload',
          as: resource.as,
        });
        preloadedUrls.add(resource.url);
      });
    }

    // 3. Preload stylesheets
    if (this.options.preload) {
      const maxPreloads = this.options.maxPreloads || 5;
      const stylesheets = processor.getStylesheetUrls();

      // Preload stylesheets up to maxPreloads limit
      for (let i = 0; i < Math.min(stylesheets.length, maxPreloads); i++) {
        const resource = stylesheets[i];
        // Skip if already preloaded in HTML
        if (preloadedUrls.has(resource.url)) continue;
        
        hints.push({
          url: resource.url,
          type: 'preload',
          as: resource.as,
        });
        preloadedUrls.add(resource.url);
      }
    }

    // 4. Prefetch scripts and other resources
    if (this.options.prefetch) {
      const maxPreloads = this.options.maxPreloads || 5;
      const scripts = processor.getScriptUrls();
      const prefetchUrls = [
        ...scripts.map(script => script.url),
        ...processor.getLinkUrls().filter((href: string) => !preloadedUrls.has(href)),
        ...(pageConfig?.prefetchRoutes || []),
        ...(pageConfig?.prefetchResources?.map((r: { url: string }) => r.url) || [])
      ];

      for (let i = 0; i < Math.min(prefetchUrls.length, maxPreloads); i++) {
        const url = prefetchUrls[i];
        // Skip if already prefetched or preloaded in HTML
        if (prefetchedUrls.has(url) || preloadedUrls.has(url)) continue;
        
        hints.push({
          url,
          type: 'prefetch',
        });
        prefetchedUrls.add(url);
      }
    }

    return hints;
  }

  public async optimize(html: string, path: string, currentDomain: string): Promise<string> {
    const pageConfig = this.findMatchingPageConfig(path);
    const processor = new HTMLProcessor(html, currentDomain, pageConfig);
    
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
    let optimizedHtml = processor.injectResourceHints(hints);

    // Apply minification if enabled
    if (this.options.minify?.enabled) {
      optimizedHtml = await this.minifyHtml(optimizedHtml);
    }

    // Cache the result if enabled
    if (this.cache && pageConfig?.cache?.enabled && this.options.cache?.enabled) {
      this.cache.set(html, optimizedHtml, pageConfig.cache.ttl);
    }

    return optimizedHtml;
  }
} 