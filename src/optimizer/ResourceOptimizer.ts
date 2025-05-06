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
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      processScripts: ['application/ld+json']
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
      
      // Get stylesheets and scripts separately
      const stylesheets = processor.getStylesheetUrls();
      const scripts = processor.getScriptUrls();
      const customPreloads = pageConfig?.preloadResources || [];

      // Preload all stylesheets by default
      stylesheets.forEach(resource => {
        hints.push({
          url: resource.url,
          type: 'preload',
          as: resource.as,
        });
        preloadedUrls.add(resource.url);
      });

      // Apply maxPreloads limit to custom preloads and scripts
      const remainingResources = [
        ...customPreloads,
        ...scripts,
      ];

      for (let i = 0; i < Math.min(remainingResources.length, maxPreloads); i++) {
        const resource = remainingResources[i];
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
        ...processor.getLinkUrls().filter((href: string) => !preloadedUrls.has(href)),
        ...(pageConfig?.prefetchRoutes || []),
        ...(pageConfig?.prefetchResources?.map((r: { url: string }) => r.url) || [])
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