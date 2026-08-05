const STORAGE_KEY = 'searchvideo_access_group';

export function getAccessContext(): string {
  const fromUrl =
    new URLSearchParams(window.location.search)
      .get('group')
      ?.trim()
      .toLowerCase() || '';

  if (/^[a-z0-9-]{1,100}$/.test(fromUrl)) {
    sessionStorage.setItem(STORAGE_KEY, fromUrl);
    return fromUrl;
  }

  return sessionStorage.getItem(STORAGE_KEY) || '';
}

export function appUrl(path: 'audio' | 'video'): string {
  const context = getAccessContext();
  return `/${path}/${context ? `?group=${encodeURIComponent(context)}` : ''}`;
}
