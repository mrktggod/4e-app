const NOT_FOUND_STAMP = "404-stamp:2026-07-04-rootfix-2";
const SERVED_BY = `4-ai-app-worker ${NOT_FOUND_STAMP}`;

function isVkLaunchRequest(url) {
  for (const key of url.searchParams.keys()) {
    if (key === 'sign' || key.startsWith('vk_')) return true;
  }
  return false;
}

function rewriteAssetRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/vk' || url.pathname === '/vk.html') {
    url.pathname = '/vk.html';
    return new Request(url.toString(), request);
  }

  if (url.pathname === '/privacy' || url.pathname === '/privacy.html') {
    url.pathname = '/privacy.html';
    return new Request(url.toString(), request);
  }

  if ((url.pathname === '/' || url.pathname === '/index.html') && isVkLaunchRequest(url)) {
    url.pathname = '/vk.html';
    return new Request(url.toString(), request);
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    url.pathname = '/index.html';
    return new Request(url.toString(), request);
  }

  return request;
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(rewriteAssetRequest(request));
    if (response.status !== 404) return response;

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Served-By', SERVED_BY);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
};
