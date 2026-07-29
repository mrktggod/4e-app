import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = resolve(process.cwd());
const host = process.env.LOAD_SMOKE_HOST || '127.0.0.1';
const port = Number(process.env.LOAD_SMOKE_PORT || process.env.AUTOTEST_PORT || 4174);
const baseUrl = process.env.BASE_URL || `http://${host}:${port}`;

const contentTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'application/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.svg', 'image/svg+xml; charset=utf-8'],
    ['.webmanifest', 'application/manifest+json; charset=utf-8'],
]);

function resolveRequestPath(url) {
    const requestUrl = new URL(url, baseUrl);
    const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const relativePath = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
    const filePath = resolve(rootDir, relativePath);
    const rootWithSep = rootDir.endsWith(sep) ? rootDir : `${rootDir}${sep}`;
    if (filePath !== rootDir && !filePath.startsWith(rootWithSep)) {
        return null;
    }
    return filePath;
}

function serveFile(request, response) {
    const filePath = resolveRequestPath(request.url || '/');
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }

    response.writeHead(200, {
        'content-type': contentTypes.get(extname(filePath)) || 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
}

function listen(server) {
    return new Promise((resolveListen, rejectListen) => {
        server.once('error', rejectListen);
        server.listen(port, host, () => {
            server.off('error', rejectListen);
            resolveListen();
        });
    });
}

function runK6() {
    return new Promise((resolveRun) => {
        const k6Args = ['run', join('autotests', 'load', 'smoke-load.js')];
        const command = process.platform === 'win32' ? 'cmd.exe' : 'k6';
        const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'k6', ...k6Args] : k6Args;
        const child = spawn(command, args, {
            env: { ...process.env, BASE_URL: baseUrl },
            stdio: 'inherit',
        });

        child.on('error', (error) => {
            console.error(`Unable to start k6: ${error.message}`);
            resolveRun(1);
        });
        child.on('exit', (code) => resolveRun(code || 0));
    });
}

const server = http.createServer(serveFile);

await listen(server);
console.log(`load:smoke server listening on ${baseUrl}`);

try {
    process.exitCode = await runK6();
} finally {
    await new Promise((resolveClose) => server.close(resolveClose));
}
