import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { PageConfig, LCPConfig } from '../types';

interface DomainCount {
  domain: string;
  count: number;
}

export class HTMLProcessor {
  private $: cheerio.CheerioAPI;
  private currentDomain: string;

  constructor(html: string, currentDomain: string) {
    this.$ = cheerio.load(html);
    this.currentDomain = currentDomain;
  }

  public extractDomains(): DomainCount[] {
    const urls = this.$('link[href], script[src], img[src], a[href]')
      .map((_index: number, el: any) => this.$(el).attr('href') || this.$(el).attr('src'))
      .get()
      .filter((url: string | undefined): url is string => 
        typeof url === 'string' && 
        url.startsWith('http') && 
        !url.startsWith('data:')
      );

    const domainCounts = new Map<string, number>();
    for (const url of urls) {
      try {
        const domain = new URL(url).hostname;
        if (domain !== this.currentDomain) {
          domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    return Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 2);
  }

  public findLCPImage(pageConfig?: PageConfig): { src: string; config: LCPConfig } | null {
    const lcpConfig = pageConfig?.lcpConfig;
    if (!lcpConfig) return null;

    const elements = this.$(lcpConfig.selector).get();
    
    for (const element of elements) {
      const src = this.$(element).attr('src');
      if (!src || src.startsWith('data:')) continue;

      const matches = typeof lcpConfig.url === 'string' 
        ? src.includes(lcpConfig.url)
        : lcpConfig.url.test(src);

      if (matches) {
        return { src, config: lcpConfig };
      }
    }

    return null;
  }

  public shouldPreloadScript(script: Element): boolean {
    if (this.$(script).attr('async') || this.$(script).attr('defer')) {
      return false;
    }

    if (this.$(script).attr('type') === 'module') {
      return false;
    }

    if (this.$(script).attr('nomodule')) {
      return false;
    }

    const src = this.$(script).attr('src');
    if (!src) {
      return false;
    }

    try {
      const srcUrl = new URL(src);
      // Only preload scripts from the same domain
      return srcUrl.hostname === this.currentDomain;
    } catch (e) {
      return false;
    }
  }

  public getStylesheetUrls(): Array<{ url: string; as: string }> {
    return this.$('link[rel="stylesheet"]')
      .map((_index: number, el: Element) => ({
        url: this.$(el).attr('href'),
        as: 'style'
      }))
      .get()
      .filter((resource): resource is { url: string; as: string } => 
        typeof resource.url === 'string' && 
        resource.url.length > 0
      );
  }

  public getScriptUrls(): Array<{ url: string; as: string }> {
    return this.$('script[src]')
      .filter((_index: number, el: Element) => this.shouldPreloadScript(el))
      .map((_index: number, el: Element) => ({
        url: this.$(el).attr('src'),
        as: 'script'
      }))
      .get()
      .filter((resource): resource is { url: string; as: string } => 
        typeof resource.url === 'string' && 
        resource.url.length > 0
      );
  }

  public getLinkUrls(): string[] {
    return this.$('a[href]')
      .map((_index: number, el: Element) => this.$(el).attr('href'))
      .get()
      .filter((href: string | undefined): href is string => 
        typeof href === 'string' && 
        href.startsWith('/')
      );
  }

  public injectResourceHints(hints: Array<{ type: string; url: string; as?: string; crossorigin?: boolean }>): string {
    const head = this.$('head');
    
    // Add a comment with timestamp to ensure each processing is unique
    head.prepend(`<!-- Processed at: ${Date.now()} -->\n`);

    hints.forEach(hint => {
      const attrs: Record<string, string> = {
        rel: hint.type,
        href: hint.url,
      };

      if (hint.as) attrs.as = hint.as;
      if (hint.crossorigin) attrs.crossorigin = '';

      head.prepend(`<link ${Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')}>`);
    });

    return this.$.html();
  }
} 