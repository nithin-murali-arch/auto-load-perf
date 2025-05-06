declare module 'html-minifier-terser' {
  interface MinifyOptions {
    collapseWhitespace?: boolean;
    removeComments?: boolean;
    removeRedundantAttributes?: boolean;
    removeScriptTypeAttributes?: boolean;
    removeStyleLinkTypeAttributes?: boolean;
    minifyCSS?: boolean;
    minifyJS?: boolean;
    minifyURLs?: boolean;
    processScripts?: string[];
  }

  export function minify(html: string, options?: MinifyOptions): Promise<string>;
} 