// Local dev server: serves public/ and runs api/submit.js like Vercel does.
//
//   npm run dev                -> uses SHEETS_WEBHOOK_URL / SHEETS_WEBHOOK_SECRET from .env if set,
//                                 otherwise runs google-apps-script/Code.gs against an in-memory
//                                 fake spreadsheet and writes the rows to .dev-submissions/.
//   PORT=4000 npm run dev      -> change the port.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const PORT = Number(process.env.PORT || 3000);

// Minimal .env loader.
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

let mock = null;
if (!process.env.SHEETS_WEBHOOK_URL) {
  mock = createMockAppsScript();
  process.env.SHEETS_WEBHOOK_SECRET = 'dev-secret';
}

const { default: handler } = await import(path.join(root, 'api/submit.js'));

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/__mock-sheets' && mock) return mock(req, res);

  if (url.pathname === '/api/submit') {
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res; };
    try { return await handler(req, res); } catch (err) { console.error(err); res.statusCode = 500; return res.end('{"ok":false}'); }
  }

  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.join(pub, rel);
  if (!file.startsWith(pub) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  if (mock) process.env.SHEETS_WEBHOOK_URL = `http://localhost:${PORT}/__mock-sheets`;
  console.log(`Workflow form running at http://localhost:${PORT}`);
  console.log(mock ? 'Sheets: MOCK (rows written to .dev-submissions/sheet.json)' : `Sheets: ${process.env.SHEETS_WEBHOOK_URL}`);
});

// Runs the real Code.gs against a fake SpreadsheetApp so the sheet layout can be checked locally.
function createMockAppsScript() {
  const outDir = path.join(root, '.dev-submissions');
  const outFile = path.join(outDir, 'sheet.json');
  fs.mkdirSync(outDir, { recursive: true });
  const book = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};

  const makeSheet = (name) => {
    book[name] ||= [];
    const rows = book[name];
    return {
      getLastRow: () => rows.length,
      setFrozenRows() {},
      getRange: (r, c, nr) => {
        const chain = {
          setValues(vals) { vals.forEach((v, i) => { rows[r - 1 + i] = v.map((x) => (x instanceof Date ? x.toISOString() : x)); }); return chain; },
          setFontWeight() { return chain; }, setBackground() { return chain; }, setFontColor() { return chain; },
        };
        return chain;
      },
    };
  };
  const ss = {
    getSheetByName: (n) => (book[n] ? makeSheet(n) : null),
    insertSheet: (n) => makeSheet(n),
  };
  const ctx = {
    console,
    JSON,
    Date,
    String,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (k === 'SHARED_SECRET' ? 'dev-secret' : null),
        setProperty() {},
      }),
    },
    // Map images land in .dev-submissions/maps/ instead of Google Drive.
    Utilities: {
      base64Decode: (b64) => Buffer.from(b64, 'base64'),
      newBlob: (bytes, type, name) => ({ bytes, type, name }),
    },
    DriveApp: {
      getFolderById: () => { throw new Error('no folder'); },
      createFolder: () => ({
        getId: () => 'dev-folder',
        createFile: (blob) => {
          const dir = path.join(outDir, 'maps');
          fs.mkdirSync(dir, { recursive: true });
          const file = path.join(dir, blob.name);
          fs.writeFileSync(file, blob.bytes);
          return { getUrl: () => `file://${file}` };
        },
      }),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ text: t, setMimeType() { return this; } }) },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'google-apps-script/Code.gs'), 'utf8'), ctx);

  return (req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const out = ctx.doPost({ postData: { contents: raw } });
      fs.writeFileSync(outFile, JSON.stringify(book, null, 2));
      res.setHeader('Content-Type', 'application/json');
      res.end(out.text);
    });
  };
}
