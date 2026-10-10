import { useEffect, useState } from 'react';

const imageCache = new Map();

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

async function findRecipeImage(name, signal) {
  const key = normalize(name);
  if (!key) return null;
  if (imageCache.has(key)) return imageCache.get(key);

  // Search Wikimedia Commons for a real photograph using the dish name, rather
  // than a generic/random food-image URL. Commons provides direct image URLs.
  const queries = [`"${name}" food`, `${name} Indian dish`, name];
  for (const query of queries) {
    const params = new URLSearchParams({
      action: 'query', format: 'json', origin: '*', generator: 'search',
      gsrsearch: `filetype:bitmap ${query}`, gsrnamespace: '6', gsrlimit: '12',
      prop: 'imageinfo', iiprop: 'url', iiurlwidth: '800'
    });
    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { signal });
      if (!response.ok) continue;
      const data = await response.json();
      const pages = Object.values(data.query?.pages || []).filter(page => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url);
      const dishWords = key.split(' ').filter(word => word.length > 2);
      pages.sort((a, b) => {
        const score = page => {
          const title = normalize(page.title.replace(/^file /, '').replace(/\.[a-z0-9]{2,5}$/i, ''));
          return dishWords.reduce((total, word) => total + (title.includes(word) ? 2 : 0), 0)
            + (title.includes('food') || title.includes('dish') || title.includes('cuisine') ? 1 : 0);
        };
        return score(b) - score(a);
      });
      const chosen = pages[0]?.imageinfo?.[0];
      const url = chosen?.thumburl || chosen?.url;
      if (url) {
        imageCache.set(key, url);
        return url;
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
    }
  }
  imageCache.set(key, null);
  return null;
}

export default function RecipeImage({ name, className = 'recipe-card-image', loading = 'lazy' }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setSrc(null);
    findRecipeImage(name, controller.signal).then(setSrc).catch(() => {});
    return () => controller.abort();
  }, [name]);
  if (!src) return null;
  return <img className={className} src={src} alt={`${name} recipe`} loading={loading}
    referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = 'none'; }} />;
}
