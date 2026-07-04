const WORKER_VERSION = "rootfix-4";
const NOT_FOUND_STAMP = `404-stamp:${WORKER_VERSION}`;
const SERVED_BY = `4-ai-app-worker ${NOT_FOUND_STAMP}`;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isVkLaunchRequest(url) {
  for (const key of url.searchParams.keys()) {
    if (key === 'sign' || key.startsWith('vk_')) return true;
  }
  return false;
}

function rewriteAssetRequest(request) {
  const url = new URL(request.url);
  const vkLaunch = isVkLaunchRequest(url);
  let targetPath = url.pathname;
  let reason = "passthrough";

  if (url.pathname === '/vk' || url.pathname === '/vk.html') {
    targetPath = '/vk.html';
    reason = 'vk-surface';
  } else if (url.pathname === '/privacy' || url.pathname === '/privacy.html') {
    targetPath = '/privacy.html';
    reason = 'privacy-surface';
  } else if ((url.pathname === '/' || url.pathname === '/index.html') && vkLaunch) {
    targetPath = '/vk.html';
    reason = 'root-vk-detected';
  } else if (url.pathname === '/' || url.pathname === '/index.html') {
    targetPath = '/index.html';
    reason = 'root-default-surface';
  }

  url.pathname = targetPath;
  return {
    vkLaunch,
    reason,
    targetPath,
    assetRequest: new Request(url.toString(), request),
  };
}

async function probeAsset(env, request, path) {
  const probeUrl = new URL(path, request.url);
  const probeRequest = new Request(probeUrl.toString(), {
    method: 'GET',
    headers: request.headers,
  });
  const response = await env.ASSETS.fetch(probeRequest);
  return {
    path,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
  };
}

function renderDiagnostic404(request, diagnostics) {
  const cf = request.cf || {};
  const ua = request.headers.get('user-agent') || '';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - 4 diagnostic</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0e140b;
      --panel: #151d12;
      --text: #f2f5e9;
      --muted: rgba(242, 245, 233, 0.64);
      --accent: #9ac23c;
      --border: rgba(154, 194, 60, 0.22);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      padding: 24px;
      background: radial-gradient(circle at top, rgba(154, 194, 60, 0.12), transparent 34%), var(--bg);
      color: var(--text);
      font-family: Inter, system-ui, sans-serif;
    }
    main {
      width: min(100%, 760px);
      margin: 0 auto;
      padding: 28px;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--panel);
    }
    h1 { margin: 0 0 10px; font-size: 28px; }
    p { margin: 0 0 20px; color: var(--muted); line-height: 1.5; }
    .stamp {
      display: inline-block;
      margin: 0 0 20px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(154, 194, 60, 0.12);
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
    }
    dl {
      margin: 0;
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 10px 14px;
    }
    dt {
      color: var(--muted);
      font-size: 13px;
    }
    dd {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      word-break: break-word;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Page not found</h1>
    <p>The worker handled this request and rendered this diagnostic 404 response.</p>
    <div class="stamp">${escapeHtml(NOT_FOUND_STAMP)}</div>
    <dl>
      <dt>worker_version</dt><dd><code>${escapeHtml(WORKER_VERSION)}</code></dd>
      <dt>request_url</dt><dd><code>${escapeHtml(request.url)}</code></dd>
      <dt>request_path</dt><dd><code>${escapeHtml(new URL(request.url).pathname)}</code></dd>
      <dt>rewrite_reason</dt><dd><code>${escapeHtml(diagnostics.reason)}</code></dd>
      <dt>rewrite_target</dt><dd><code>${escapeHtml(diagnostics.targetPath)}</code></dd>
      <dt>vk_launch_detected</dt><dd><code>${escapeHtml(diagnostics.vkLaunch)}</code></dd>
      <dt>colo</dt><dd><code>${escapeHtml(cf.colo || '')}</code></dd>
      <dt>country</dt><dd><code>${escapeHtml(cf.country || '')}</code></dd>
      <dt>user_agent</dt><dd><code>${escapeHtml(ua)}</code></dd>
      <dt>asset_response</dt><dd><code>${escapeHtml(`${diagnostics.assetStatus} ${diagnostics.assetContentType}`)}</code></dd>
      <dt>probe_index</dt><dd><code>${escapeHtml(`${diagnostics.indexProbe.status} ${diagnostics.indexProbe.contentType}`)}</code></dd>
      <dt>probe_vk</dt><dd><code>${escapeHtml(`${diagnostics.vkProbe.status} ${diagnostics.vkProbe.contentType}`)}</code></dd>
    </dl>
  </main>
</body>
</html>`;
  return html;
}

export default {
  async fetch(request, env) {
    const rewritten = rewriteAssetRequest(request);
    const response = await env.ASSETS.fetch(rewritten.assetRequest);
    if (response.status !== 404) return response;

    const indexProbe = await probeAsset(env, request, '/index.html');
    const vkProbe = await probeAsset(env, request, '/vk.html');
    const body = renderDiagnostic404(request, {
      reason: rewritten.reason,
      targetPath: rewritten.targetPath,
      vkLaunch: rewritten.vkLaunch,
      assetStatus: response.status,
      assetContentType: response.headers.get('content-type') || '',
      indexProbe,
      vkProbe,
    });

    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=UTF-8');
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Served-By', SERVED_BY);
    headers.set('X-Worker-Version', WORKER_VERSION);
    return new Response(body, {
      status: 404,
      statusText: 'Not Found',
      headers,
    });
  }
};
