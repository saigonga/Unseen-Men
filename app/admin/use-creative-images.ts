'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { staffFetch } from './staff-fetch';

type CachedImage = { blob: Blob; url: string };
type ImageState = { key: string; status: 'loading' | 'ready' | 'error'; image?: CachedImage };
const MAX_IMAGES = 12;

export function useCreativeImages(active: boolean, imageUrl: string, nextUrl: string) {
  const cache = useRef(new Map<string, CachedImage>());
  const pending = useRef(new Map<string, Promise<CachedImage>>());
  const generation = useRef(0);
  const [state, setState] = useState<ImageState>({ key: '', status: 'loading' });
  const [retry, setRetry] = useState(0);

  const clear = useCallback(() => {
    generation.current++;
    for (const image of cache.current.values()) URL.revokeObjectURL(image.url);
    cache.current.clear();
    pending.current.clear();
    setState({ key: '', status: 'loading' });
    setRetry(value => value + 1);
  }, []);

  const load = useCallback((url: string) => {
    const existing = cache.current.get(url);
    if (existing) {
      cache.current.delete(url);
      cache.current.set(url, existing);
      return Promise.resolve(existing);
    }
    const inFlight = pending.current.get(url);
    if (inFlight) return inFlight;
    const started = generation.current;
    const request = staffFetch(url, { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('Image unavailable');
      const blob = await response.blob();
      if (started !== generation.current) throw new Error('Session changed');
      const image = { blob, url: URL.createObjectURL(blob) };
      cache.current.set(url, image);
      while (cache.current.size > MAX_IMAGES) {
        const oldest = cache.current.keys().next().value as string;
        URL.revokeObjectURL(cache.current.get(oldest)!.url);
        cache.current.delete(oldest);
      }
      return image;
    }).finally(() => {
      if (pending.current.get(url) === request) pending.current.delete(url);
    });
    pending.current.set(url, request);
    return request;
  }, []);

  useEffect(() => {
    if (!active || !imageUrl) return;
    let cancelled = false;
    setState({ key: imageUrl, status: 'loading' });
    load(imageUrl).then(image => {
      if (cancelled) return;
      setState({ key: imageUrl, status: 'ready', image });
      if (nextUrl && nextUrl !== imageUrl) void load(nextUrl).catch(() => {});
    }).catch(() => { if (!cancelled) setState({ key: imageUrl, status: 'error' }); });
    return () => { cancelled = true; };
  }, [active, imageUrl, nextUrl, load, retry]);

  useEffect(() => {
    if (!active) return;
    const images = cache.current;
    const requests = pending.current;
    return () => {
      generation.current++;
      for (const image of images.values()) URL.revokeObjectURL(image.url);
      images.clear();
      requests.clear();
    };
  }, [active]);

  return {
    status: state.key === imageUrl ? state.status : 'loading',
    image: state.key === imageUrl ? state.image : undefined,
    retry: () => setRetry(value => value + 1),
    clear,
  };
}
