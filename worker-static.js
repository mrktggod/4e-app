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
    return env.ASSETS.fetch(rewriteAssetRequest(request));
  }
};
