export const picturePreloaderScript = `
(function() {
  function preloadPictureSources() {
    const pictures = document.querySelectorAll('picture[data-auto-load-perf]');
    
    pictures.forEach(picture => {
      const sources = picture.querySelectorAll('source');
      const img = picture.querySelector('img');
      if (!img) return;

      // Function to preload an image
      const preloadImage = (url) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
      };

      // Function to get the first URL from srcset
      const getFirstSrcFromSrcset = (srcset) => {
        return srcset.split(',')[0].trim().split(' ')[0];
      };

      // Check if any source matches current media query
      let matchedSource = false;
      sources.forEach(source => {
        if (source.media) {
          if (window.matchMedia(source.media).matches) {
            const srcset = source.srcset;
            if (srcset) {
              preloadImage(getFirstSrcFromSrcset(srcset));
              matchedSource = true;
            }
          }
        }
      });

      // If no source matched or no media queries, preload the first source
      if (!matchedSource && sources.length > 0) {
        const firstSource = sources[0];
        if (firstSource.srcset) {
          preloadImage(getFirstSrcFromSrcset(firstSource.srcset));
        }
      }

      // If no sources or no srcset, preload the img src
      if (!matchedSource && sources.length === 0 && img.src) {
        preloadImage(img.src);
      }
    });
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadPictureSources);
  } else {
    preloadPictureSources();
  }

  // Re-run on resize to handle media query changes
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(preloadPictureSources, 100);
  });
})();
`; 