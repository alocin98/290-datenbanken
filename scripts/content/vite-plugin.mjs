import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const zipsPathPrefix = "/assets/zips/";

function getZipAssetName(pathname, base) {
  const prefixes = [zipsPathPrefix];

  if (base && base !== "/") {
    prefixes.push(`${base}${zipsPathPrefix.slice(1)}`);
  }

  const zipName = prefixes
    .filter((prefix) => pathname.startsWith(prefix))
    .map((prefix) => pathname.slice(prefix.length))
    .find(Boolean);

  if (!zipName || zipName !== path.basename(zipName) || !zipName.endsWith(".zip")) {
    return null;
  }

  return zipName;
}

function getZipAssetVersion(zipName, docsRoot, zipVersionCache) {
  const filePath = path.join(docsRoot, "assets", "zips", zipName);

  try {
    const stats = fs.statSync(filePath);
    const cached = zipVersionCache.get(filePath);

    if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
      return cached.version;
    }

    const version = crypto
      .createHash("sha256")
      .update(fs.readFileSync(filePath))
      .digest("hex")
      .slice(0, 12);

    zipVersionCache.set(filePath, {
      mtimeMs: stats.mtimeMs,
      size: stats.size,
      version
    });

    return version;
  } catch {
    return null;
  }
}

function rewriteZipAssetUrl(url, { docsRoot, base, zipVersionCache }) {
  if (!url.startsWith("/") || url.startsWith("//")) {
    return url;
  }

  const parsed = new URL(url, "https://example.com");
  const zipName = getZipAssetName(parsed.pathname, base);

  if (!zipName) {
    return url;
  }

  const version = getZipAssetVersion(zipName, docsRoot, zipVersionCache);

  if (!version) {
    return url;
  }

  parsed.searchParams.set("v", version);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function rewriteInternalUrl(url, context) {
  const { linkAliases } = context;

  if (!url.startsWith("/") || url.startsWith("//")) {
    return url;
  }

  const parsed = new URL(url, "https://example.com");
  const alias =
    linkAliases.get(parsed.pathname) ??
    linkAliases.get(parsed.pathname.endsWith("/") ? parsed.pathname.slice(0, -1) : `${parsed.pathname}/`);

  if (!alias) {
    return rewriteZipAssetUrl(url, context);
  }

  return rewriteZipAssetUrl(`${alias}${parsed.search}${parsed.hash}`, context);
}

function rewriteMarkdownLinks(source, context) {
  const markdownLinkPattern = /(!?\[[^\]]*]\()([^) \t\n]+)(\))/g;
  const htmlAttributePattern = /((?:href|src)=["'])(\/[^"']+)(["'])/g;

  const withMarkdownLinks = source.replace(markdownLinkPattern, (fullMatch, prefix, url, suffix) => {
    return `${prefix}${rewriteInternalUrl(url, context)}${suffix}`;
  });

  return withMarkdownLinks.replace(htmlAttributePattern, (fullMatch, prefix, url, suffix) => {
    return `${prefix}${rewriteInternalUrl(url, context)}${suffix}`;
  });
}

export function createContentStructurePlugin({ docsRoot, linkAliases, base }) {
  const contentRoot = path.join(docsRoot, "content");
  const contentScriptsRoot = path.resolve(docsRoot, "..", "scripts", "content");
  const vitepressRoot = path.join(docsRoot, ".vitepress");
  const zipVersionCache = new Map();
  let restartTimer;
  let restartInFlight = false;
  const transformContext = { docsRoot, linkAliases, base, zipVersionCache };
  const restartWatchRoots = [contentRoot, contentScriptsRoot].map((watchedRoot) => path.normalize(watchedRoot));

  const normalizeWatchedPath = (filePath) => {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    return path.normalize(absolutePath);
  };

  return {
    name: "content-structure-restart",
    transform(code, id) {
      const cleanId = id.split("?", 1)[0];

      if (!cleanId.startsWith(docsRoot) || cleanId.startsWith(vitepressRoot) || !cleanId.endsWith(".md")) {
        return null;
      }

      return rewriteMarkdownLinks(code, transformContext);
    },
    configureServer(server) {
      server.watcher.add([contentRoot, contentScriptsRoot]);

      const scheduleRestart = (filePath) => {
        const normalizedPath = normalizeWatchedPath(filePath);

        if (!restartWatchRoots.some((watchedRoot) => normalizedPath.startsWith(watchedRoot))) {
          return;
        }

        clearTimeout(restartTimer);
        restartTimer = setTimeout(async () => {
          if (restartInFlight) {
            return;
          }

          restartInFlight = true;
          server.config.logger.info(
            "Content tree changed: restarting dev server to rebuild generated navigation."
          );

          try {
            await server.restart();
          } finally {
            restartInFlight = false;
          }
        }, 120);
      };

      const onAdd = (filePath) => scheduleRestart(filePath);
      const onChange = (filePath) => scheduleRestart(filePath);
      const onUnlink = (filePath) => scheduleRestart(filePath);
      const onAddDir = (filePath) => scheduleRestart(filePath);
      const onUnlinkDir = (filePath) => scheduleRestart(filePath);

      server.watcher.on("add", onAdd);
      server.watcher.on("change", onChange);
      server.watcher.on("unlink", onUnlink);
      server.watcher.on("addDir", onAddDir);
      server.watcher.on("unlinkDir", onUnlinkDir);

      return () => {
        clearTimeout(restartTimer);
        server.watcher.off("add", onAdd);
        server.watcher.off("change", onChange);
        server.watcher.off("unlink", onUnlink);
        server.watcher.off("addDir", onAddDir);
        server.watcher.off("unlinkDir", onUnlinkDir);
      };
    }
  };
}
