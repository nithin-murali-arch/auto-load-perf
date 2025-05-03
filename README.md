# Auto Load Performance Optimizer

A high-performance middleware for Express and Next.js applications that automatically optimizes resource loading through intelligent resource hints (preconnect, prefetch, preload).

## Features

- 🚀 **Automatic Resource Optimization**: Intelligently adds resource hints to your HTML
- 🔄 **Smart Caching**: Configurable caching system with TTL and size limits
- 🎯 **Page-Specific Configuration**: Fine-tune optimization per route
- 📦 **Framework Support**: Works with both Express and Next.js
- 🔍 **LCP Optimization**: Special handling for Largest Contentful Paint elements
- ⚡ **Performance First**: Zero runtime overhead with efficient caching

## Installation

```bash
npm install auto-load-perf
# or
yarn add auto-load-perf
```

## Quick Start

### Express

```typescript
import express from 'express';
import { createExpressMiddleware } from 'auto-load-perf';

const app = express();

const options = {
  preconnect: true,
  prefetch: true,
  preload: true,
  priority: 'auto',
  maxPreloads: 5,
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 3600000 // 1 hour
  },
  pages: {
    '/home': {
      cache: {
        enabled: true,
        ttl: 1800000 // 30 minutes
      },
      lcpConfig: {
        selector: '.hero-image',
        url: /hero\.(jpg|png)$/
      },
      preloadResources: [
        { url: '/critical.css', as: 'style' }
      ],
      prefetchRoutes: ['/about', '/contact']
    }
  }
};

app.use(createExpressMiddleware(options));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <img class="hero-image" src="/hero.jpg">
        <script src="/app.js"></script>
      </body>
    </html>
  `);
});
```

### Next.js

```typescript
// middleware.ts
import { createNextMiddleware } from 'auto-load-perf';

export const middleware = createNextMiddleware({
  preconnect: true,
  prefetch: true,
  preload: true,
  priority: 'auto',
  maxPreloads: 5,
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 3600000
  },
  pages: {
    '/': {
      cache: {
        enabled: true,
        ttl: 1800000
      },
      lcpConfig: {
        selector: '.hero-image',
        url: /hero\.(jpg|png)$/
      }
    }
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

## Configuration Options

### Global Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `preconnect` | boolean | `true` | Enable preconnect hints for external domains |
| `prefetch` | boolean | `true` | Enable prefetch hints for navigation |
| `preload` | boolean | `true` | Enable preload hints for critical resources |
| `priority` | 'auto' \| 'high' \| 'low' | 'auto' | Priority level for resource hints |
| `maxPreloads` | number | `5` | Maximum number of resources to preload |
| `cache` | object | `undefined` | Global cache configuration |
| `pages` | object | `{}` | Page-specific configurations |

### Cache Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable caching |
| `maxSize` | number | `100` | Maximum number of cached entries |
| `ttl` | number | `undefined` | Time to live in milliseconds |

### Page Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lcpConfig` | object | `undefined` | LCP element configuration |
| `preloadResources` | array | `[]` | Resources to preload |
| `prefetchRoutes` | array | `[]` | Routes to prefetch |
| `prefetchResources` | array | `[]` | Resources to prefetch |
| `cache` | object | `undefined` | Page-specific cache configuration |

## Performance Impact

The middleware is designed to have minimal impact on your application's performance:

- **Zero Runtime Overhead**: Processing is done only once per unique HTML content
- **Efficient Caching**: SHA-256 hashing ensures fast cache lookups
- **Memory Efficient**: Configurable cache size limits memory usage
- **TTL Support**: Automatic cache invalidation prevents stale content

## Best Practices

1. **Enable Caching**: Always enable caching in production for optimal performance
2. **Configure TTL**: Set appropriate TTL values based on your content update frequency
3. **Page-Specific Settings**: Use page-specific configurations for fine-grained control
4. **Monitor Cache Size**: Adjust `maxSize` based on your application's needs
5. **LCP Optimization**: Configure LCP elements for critical images

## License

MIT