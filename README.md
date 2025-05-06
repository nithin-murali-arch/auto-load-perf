# Auto Load Perf 🚀

[![npm version](https://img.shields.io/npm/v/auto-load-perf.svg)](https://www.npmjs.com/package/auto-load-perf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> A high-performance optimization library that automatically enhances your web application's loading performance through intelligent resource management and optimization strategies.

## ✨ Features

- 🚀 **Automatic Resource Optimization**
  - Smart preconnect, preload, and prefetch hint generation
  - Intelligent resource prioritization
  - Configurable optimization strategies

- 🎯 **Performance Metrics Optimization**
  - LCP (Largest Contentful Paint) optimization
  - FCP (First Contentful Paint) optimization
  - Automatic critical resource detection

- 🖼️ **Advanced Image Optimization**
  - Automatic picture element detection and optimization
  - Responsive image preloading
  - Smart media query handling

- 📦 **Resource Management**
  - Stylesheet optimization and prioritization
  - Custom DOM transformations
  - Intelligent caching system

## 📦 Installation

```bash
# Using npm
npm install auto-load-perf

# Using yarn
yarn add auto-load-perf

# Using pnpm
pnpm add auto-load-perf
```

## 🚀 Quick Start

### Next.js

```typescript
// middleware.ts
import { createNextMiddleware } from 'auto-load-perf';

export const middleware = createNextMiddleware({
  // Enable all optimization features
  preconnect: true,
  prefetch: true,
  preload: true,
  
  // Configure optimization strategy
  priority: 'auto',
  maxPreloads: 5,
  
  // Enable caching
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 3600000 // 1 hour
  },
  
  // Page-specific optimizations
  pages: {
    '/': {
      // Cache configuration
      cache: {
        enabled: true,
        ttl: 1800000 // 30 minutes
      },
      
      // LCP optimization
      lcpConfig: {
        selector: '.hero-image',
        url: /hero\.(jpg|png)$/,
        priority: 'high',
        loading: 'eager',
        fetchpriority: 'high'
      },
      
      // FCP optimization
      fcpOptimizations: {
        criticalStyles: [
          '.hero { display: block; }',
          '.hero-image { width: 100%; }'
        ]
      }
    }
  }
});

// Configure middleware matching
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### Express

```typescript
import express from 'express';
import { createExpressMiddleware } from 'auto-load-perf';

const app = express();

app.use(createExpressMiddleware({
  // Enable optimizations
  preconnect: true,
  prefetch: true,
  preload: true,
  
  // Configure strategy
  priority: 'auto',
  maxPreloads: 5,
  
  // Page optimizations
  pages: {
    '/': {
      lcpConfig: {
        selector: '.hero-image',
        url: /hero\.(jpg|png)$/,
        priority: 'high'
      }
    }
  }
}));
```

## ⚙️ Configuration

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

| Option | Type | Description |
|--------|------|-------------|
| `lcpConfig` | object | LCP element configuration |
| `preloadResources` | array | Resources to preload |
| `prefetchRoutes` | array | Routes to prefetch |
| `prefetchResources` | array | Resources to prefetch |
| `cache` | object | Page-specific cache configuration |
| `customTransform` | function | Custom DOM transformation function |
| `fcpOptimizations` | object | FCP optimization configuration |

### LCP Configuration

| Option | Type | Description |
|--------|------|-------------|
| `selector` | string | CSS selector for the LCP element |
| `url` | string \| RegExp | URL pattern to match |
| `attributes` | object | Additional attributes to add |
| `priority` | 'high' \| 'low' \| 'auto' | Resource priority |
| `loading` | 'eager' \| 'lazy' | Loading strategy |
| `fetchpriority` | 'high' \| 'low' \| 'auto' | Fetch priority |

### FCP Optimizations

| Option | Type | Description |
|--------|------|-------------|
| `criticalStyles` | string[] | Critical CSS to inline |

## 🔧 How It Works

### Resource Hints

The library intelligently manages resource hints to optimize loading:

1. **Preconnect**: Establishes early connections to external domains
   ```html
   <link rel="preconnect" href="https://cdn.example.com" crossorigin>
   ```

2. **Preload**: Prioritizes critical resources
   ```html
   <link rel="preload" href="/critical.css" as="style">
   <link rel="preload" href="/hero.jpg" as="image">
   ```

3. **Prefetch**: Prepares for future navigation
   ```html
   <link rel="prefetch" href="/about">
   ```

### Picture Element Optimization

Automatically optimizes responsive images:

```html
<!-- Before -->
<img src="hero.jpg" alt="Hero">

<!-- After -->
<picture data-auto-load-perf>
  <source srcset="hero.webp" type="image/webp">
  <source srcset="hero.jpg" type="image/jpeg">
  <img src="hero.jpg" alt="Hero" loading="eager" fetchpriority="high">
</picture>
```

### Stylesheet Optimization

Optimizes stylesheet loading and execution:

1. Moves stylesheets to end of `<head>`
2. Adds preload hints for critical stylesheets
3. Supports critical CSS inlining

### Custom Transformations

Extend functionality with custom DOM transformations:

```typescript
{
  pages: {
    '/': {
      customTransform: ($) => {
        // Optimize images
        $('img').addClass('optimized-image');
        
        // Defer non-critical scripts
        $('script:not([data-critical])').attr('defer', '');
        
        // Add loading attributes
        $('img[data-lazy]').attr('loading', 'lazy');
      }
    }
  }
}
```

## 📚 Best Practices

### LCP Optimization

1. **Identify LCP Elements**
   ```typescript
   lcpConfig: {
     selector: '.hero-image',
     url: /hero\.(jpg|png)$/,
     priority: 'high'
   }
   ```

2. **Use Picture Elements**
   ```html
   <picture>
     <source srcset="hero.webp" type="image/webp">
     <source srcset="hero.jpg" type="image/jpeg">
     <img src="hero.jpg" alt="Hero">
   </picture>
   ```

### FCP Optimization

1. **Provide Critical CSS**
   ```typescript
   fcpOptimizations: {
     criticalStyles: [
       '.hero { display: block; }',
       '.hero-image { width: 100%; }'
     ]
   }
   ```

2. **Optimize Stylesheet Loading**
   - Let the library handle stylesheet optimization
   - Use preload hints for critical stylesheets

### Resource Hints

1. **Preconnect for External Domains**
   ```typescript
   preconnect: true
   ```

2. **Preload Critical Resources**
   ```typescript
   preloadResources: [
     { url: '/critical.css', as: 'style' },
     { url: '/hero.jpg', as: 'image' }
   ]
   ```

3. **Prefetch for Navigation**
   ```typescript
   prefetchRoutes: ['/about', '/contact']
   ```

### Caching Strategy

1. **Enable for Stable Pages**
   ```typescript
   cache: {
     enabled: true,
     ttl: 3600000 // 1 hour
   }
   ```

2. **Disable for Dynamic Content**
   ```typescript
   pages: {
     '/dynamic': {
       cache: {
         enabled: false
       }
     }
   }
   ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Your Name]