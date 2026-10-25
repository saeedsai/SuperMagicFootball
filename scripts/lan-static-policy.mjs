// LAN companion HTTP server: explicit public game asset allowlist.
// Never expose repository internals, dotfiles, tests, scripts or credentials.
const ROOT_FILES = new Set(['index.html', 'style.css', 'sw.js', 'icon-180.png']);
const ASSET_EXTENSIONS = new Set(['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'ogg', 'woff2']);
export function isPublicLanPath(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.length > 512 ||
      pathname.includes('\\') || pathname.includes('\0') || pathname.includes('//') || pathname.includes('%')) return false;
  if (pathname === '/') return true;
  const parts = pathname.slice(1).split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || part.startsWith('.'))) return false;
  if (parts.length === 1) return ROOT_FILES.has(parts[0]);
  const extension = parts.at(-1).split('.').at(-1).toLowerCase();
  if (parts[0] === 'src') return extension === 'js';
  if (parts[0] === 'data') return extension === 'json';
  if (parts[0] === 'assets') return ASSET_EXTENSIONS.has(extension);
  return false;
}
