export function normalizeYouTubeUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  // Ensure URL constructor works even if protocol is missing
  let urlStr = trimmed;
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`;
  }

  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname || '';

    let id: string | null = null;

    // youtu.be short links (allow subdomains like www.youtu.be)
    if (host.endsWith('youtu.be')) {
      id = pathname.replace(/^\//, '');
    }

    // youtube domains
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      // Common forms: /watch?v=ID, /embed/ID, /shorts/ID
      if (pathname.startsWith('/watch')) {
        id = url.searchParams.get('v');
      } else if (pathname.startsWith('/embed/')) {
        const embedId = pathname.split('/')[2];
        id = embedId ?? null;
      } else if (pathname.startsWith('/shorts/')) {
        const shortsId = pathname.split('/')[2];
        id = shortsId ?? null;
      } else {
        // Some other forms might still carry the v= param
        id = url.searchParams.get('v') || id;
      }
    }

    if (id) {
      // Strip query/hash fragments if present
      const splitResult = id.split(/[?#&]/)[0];
      id = splitResult ?? null;
    }

    // Fallback: try to extract an 11-char ID from the raw input using regex
    if (!id) {
      const fallback = trimmed.match(/(?:v=|\/|be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
      if (fallback && fallback[1]) id = fallback[1];
    }

    // Validate ID (YouTube video IDs are 11 chars using A-Z a-z 0-9 _ -)
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
      return `https://www.youtube.com/watch?v=${id}`;
    }

    return null;
  } catch {
    // If URL parsing fails, try a best-effort regex extraction
    const m = trimmed.match(/(?:v=|\/|be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (m && m[1]) return `https://www.youtube.com/watch?v=${m[1]}`;
    return null;
  }
}

export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  const normalized = normalizeYouTubeUrl(input);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    return url.searchParams.get('v');
  } catch {
    return null;
  }
}
