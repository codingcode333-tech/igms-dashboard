const CACHE_NAME = 'igms-cache';

// window.addEventListener('logout', () => {
//   // clear the data from localStorage when a user logs out
//   clearCache();
// });

export async function cacheable<T>(fn, key: string, final = null) {
  let result;
  let cache = getCache()

  if (!cache[key]) {
    let data
    if (final)
      data = (await fn().finally(() => final())).data
    else
      data = (await fn()).data
    cache = getCache()
    cache[key] = data
    localStorage.setItem(CACHE_NAME, JSON.stringify(cache));
  }
  else {
    if (final)
      final()
  }

  return cache[key]
  // try {
  //   // retrieve the data from backend.
  //   result = await fn();
  //   // save the data to localStorage.
  //   const cache = getCache();
  //   cache[key] = result;
  //   localStorage.setItem(CACHE_NAME, JSON.stringify(cache));
  // } catch {
  //   // if failed to retrieve the data from backend, try localStorage.
  //   const cache = getCache();
  //   const cached = cache[key];
  //   // use the cached data if available, otherwise the default value.
  //   // result = cached === undefined ? defaultValue : cached;
  // }

  // return result;
}

export function getCache(): any {
  const cache = localStorage.getItem(CACHE_NAME) || '{}';
  return JSON.parse(cache);
}

export function clearCache() {
  localStorage.removeItem(CACHE_NAME);
}