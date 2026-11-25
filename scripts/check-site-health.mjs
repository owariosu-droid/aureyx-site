const base = 'https://aureyx-site.vercel.app';
export async function checkSite(fetcher = fetch) {
  for (const [path, marker] of [['/', 'Aureyx'], ['/music', 'Supporter releases'], ['/api/health', '"status":"ok"']]) {
    const response = await fetcher(base + path, { redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Site check failed: ${path} HTTP ${response.status}`);
    if (response.headers.get('x-content-type-options') !== 'nosniff' || response.headers.get('x-frame-options') !== 'DENY') throw new Error(`Security headers missing: ${path}`);
    const reader = response.body.getReader();
    let size = 0;
    let body = '';
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2 * 1024 * 1024) { await reader.cancel(); throw new Error(`Response too large: ${path}`); }
        body += decoder.decode(value, { stream: true });
      }
    } finally { reader.releaseLock(); }
    if (!body.includes(marker)) throw new Error(`Expected content missing: ${path}`);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  checkSite().then(() => console.log('Public pages, content readiness and security headers passed.')).catch(error => { console.error(error.message); process.exitCode = 1; });
}
