import {Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';

/**
 * Lightweight client-side cache for images using the Cache Storage API.
 * Usage: <img [appCacheImg]="url"> — will load from cache if present, otherwise
 * fetch, cache, and display. Falls back to direct <img src> on fetch/cache errors.
 */
@Directive({
  selector: 'img[appCacheImg]',
  standalone: true
})
export class CacheImgDirective implements OnChanges, OnDestroy {
  @Input({ required: true }) appCacheImg!: string;

  private static readonly CACHE_NAME = 'poster-cache-v1';
  private objectUrl: string | null = null;
  private lastUrl: string | null = null;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('appCacheImg' in changes) {
      const url = this.appCacheImg;
      if (!url) {
        // No URL — clear src
        this.setLoading(true);
        this.setImgSrc('');
        return;
      }
      // If same URL, do nothing
      if (this.lastUrl === url) return;
      this.lastUrl = url;
      // mark as loading (will fade-in on load)
      this.setLoading(true);
      this.loadAndCache(url).catch(() => {
        // As a safety net, let the browser try loading directly
        this.setImgSrc(url);
      });
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  private async loadAndCache(url: string): Promise<void> {
    try {
      // If Cache Storage is not available, fallback to direct load
      if (!(window as any).caches) {
        this.setImgSrc(url);
        return;
      }

      const cache = await caches.open(CacheImgDirective.CACHE_NAME);
      let response = await cache.match(url);
      if (!response) {
        // Not cached — fetch and cache
        response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Image fetch failed: ' + response.status);
        // Put a clone into the cache, ignore failures silently (quota, opaque, etc.)
        try {
          await cache.put(url, response.clone());
        } catch {
          // ignore cache put errors
        }
      }

      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      this.setImgSrc(objUrl, true);
    } catch (e) {
      // Any issue — load directly without caching
      this.setImgSrc(url);
    }
  }

  private setImgSrc(src: string, isObjectUrl = false): void {
    // Revoke previous object URL if any
    if (isObjectUrl) {
      this.revokeObjectUrl();
      this.objectUrl = src;
    }
    const img = this.el.nativeElement;
    // Ensure previous handlers don't leak
    img.onload = null;
    img.onerror = null;
    // Attach one-time handlers to toggle loaded state
    img.onload = () => {
      this.setLoading(false);
      // cleanup
      img.onload = null;
      img.onerror = null;
    };
    img.onerror = () => {
      // Even on error, end loading state to avoid infinite shimmer
      this.setLoading(false);
      img.onload = null;
      img.onerror = null;
    };
    img.src = src;
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private setLoading(loading: boolean) {
    const img = this.el.nativeElement;
    if (loading) {
      img.classList.remove('loaded');
    } else {
      img.classList.add('loaded');
    }
  }
}
