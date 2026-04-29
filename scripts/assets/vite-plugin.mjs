import { createReadStream } from "node:fs";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import syncFs from "node:fs";
import path from "node:path";

const zipsUrlPrefix = "/assets/zips/";

function getZipNameFromRequest(requestUrl, base) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  const prefixes = [zipsUrlPrefix];

  if (base && base !== "/") {
    prefixes.push(`${base}${zipsUrlPrefix.slice(1)}`);
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

async function copyZipAssets(sourceRoot, outputRoot) {
  try {
    await fs.access(sourceRoot);
  } catch {
    return;
  }

  const targetRoot = path.join(outputRoot, "assets", "zips");
  await fs.rm(targetRoot, { recursive: true, force: true });
  await fs.mkdir(targetRoot, { recursive: true });

  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".zip")) {
      continue;
    }

    await fs.copyFile(path.join(sourceRoot, entry.name), path.join(targetRoot, entry.name));
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getZipAssetVersion(zipName, zipsRoot, zipVersionCache) {
  const filePath = path.join(zipsRoot, zipName);

  try {
    const stats = syncFs.statSync(filePath);
    const cached = zipVersionCache.get(filePath);

    if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
      return cached.version;
    }

    const version = crypto
      .createHash("sha256")
      .update(syncFs.readFileSync(filePath))
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

function createZipUrlPattern(base) {
  const prefixes = [zipsUrlPrefix];

  if (base && base !== "/") {
    prefixes.push(`${base}${zipsUrlPrefix.slice(1)}`);
  }

  return new RegExp(
    `(${prefixes.map(escapeRegExp).join("|")})([A-Za-z0-9._-]+\\.zip)(\\?[^"'\\s<>)]*)?`,
    "g"
  );
}

function addZipUrlVersions(source, { zipsRoot, base, zipVersionCache }) {
  const zipUrlPattern = createZipUrlPattern(base);

  return source.replace(zipUrlPattern, (match, prefix, zipName, query = "") => {
    const version = getZipAssetVersion(zipName, zipsRoot, zipVersionCache);

    if (!version) {
      return match;
    }

    const searchParams = new URLSearchParams(query.startsWith("?") ? query.slice(1) : "");
    searchParams.set("v", version);

    return `${prefix}${zipName}?${searchParams.toString()}`;
  });
}

export function createZipAssetsPlugin({ docsRoot, base }) {
  const zipsRoot = path.join(docsRoot, "assets", "zips");
  const copiedOutputRoots = new Set();
  const zipVersionCache = new Map();
  let resolvedConfig;

  return {
    name: "zip-assets",
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || (req.method !== "GET" && req.method !== "HEAD")) {
          next();
          return;
        }

        const zipName = getZipNameFromRequest(req.url, base);

        if (!zipName) {
          next();
          return;
        }

        const filePath = path.join(zipsRoot, zipName);

        try {
          await fs.access(filePath);
        } catch {
          next();
          return;
        }

        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

        if (req.method === "HEAD") {
          res.end();
          return;
        }

        createReadStream(filePath).pipe(res);
      });
    },
    generateBundle(options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === "chunk") {
          asset.code = addZipUrlVersions(asset.code, { zipsRoot, base, zipVersionCache });
          continue;
        }

        if (asset.type === "asset" && typeof asset.source === "string") {
          asset.source = addZipUrlVersions(asset.source, { zipsRoot, base, zipVersionCache });
        }
      }
    },
    async writeBundle(options) {
      const outputRoot = options.dir
        ? path.resolve(options.dir)
        : path.resolve(resolvedConfig.root, resolvedConfig.build.outDir);

      if (copiedOutputRoots.has(outputRoot)) {
        return;
      }

      copiedOutputRoots.add(outputRoot);
      await copyZipAssets(zipsRoot, outputRoot);
    }
  };
}
