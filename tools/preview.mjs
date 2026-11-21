// Local preview of the GitHub Pages site. Approximates the Jekyll build:
// README.md -> home page, *.md -> *.html, .md links rewritten, first H1 = title,
// every page wrapped in _layouts/default.html (rendered with Liquid).
// Pages are rebuilt on every request, so just edit and refresh.
//
//   node tools/preview.mjs        then open http://localhost:4000/ai-playbook/

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { Liquid } from "liquidjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "/ai-playbook";
const PORT = Number(process.env.PORT) || 4000;

const liquid = new Liquid({ root: ROOT });
liquid.registerFilter("relative_url", (p) => BASE + (p.startsWith("/") ? p : "/" + p));
liquid.registerFilter("absolute_url", (p) => `http://localhost:${PORT}` + BASE + (p.startsWith("/") ? p : "/" + p));

function readConfig() {
  const site = {};
  for (const line of fs.readFileSync(path.join(ROOT, "_config.yml"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) site[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  site.github = { repository_nwo: "cshipleygit/ai-playbook" };
  return site;
}

function renderMarkdown(src) {
  const marked = new Marked(gfmHeadingId());
  marked.use({
    walkTokens(t) {
      if (t.type === "link" && !/^[a-z]+:/i.test(t.href)) t.href = t.href.replace(/\.md(#|$)/, ".html$1");
    },
  });
  return marked.parse(src);
}

async function renderPage(mdFile, url) {
  const src = fs.readFileSync(mdFile, "utf8");
  const title = (src.match(/^#\s+(.+)$/m) || [])[1];
  const dir = url.endsWith("/") ? url : url.slice(0, url.lastIndexOf("/") + 1);
  const layout = fs.readFileSync(path.join(ROOT, "_layouts", "default.html"), "utf8");
  return liquid.parseAndRender(layout, {
    site: readConfig(),
    page: { url, dir, title },
    content: renderMarkdown(src),
  });
}

const TYPES = { ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".ico": "image/x-icon" };

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!p.startsWith(BASE)) { res.writeHead(302, { Location: BASE + "/" }); return res.end(); }
    p = p.slice(BASE.length) || "/";

    let md = null, url = p;
    if (p === "/" || p === "/index.html") { md = "README.md"; url = "/"; }
    else if (p.endsWith(".html")) md = p.slice(1, -5) + ".md";
    else if (p.endsWith("/")) md = p.slice(1) + "README.md";

    if (md) {
      const file = path.join(ROOT, md);
      if (file.startsWith(ROOT) && fs.existsSync(file)) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        return res.end(await renderPage(file, url));
      }
    } else {
      const file = path.join(ROOT, p);
      if (file.startsWith(ROOT) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
        return res.end(fs.readFileSync(file));
      }
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found: " + p);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(String(e.stack || e));
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}${BASE}/`));
