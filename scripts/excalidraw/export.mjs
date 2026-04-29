import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const EXCALIDRAW_SUFFIX = ".excalidraw.json";

let exportUtilsPromise;

function createFontFaceStub() {
  return class FakeFontFace {
    constructor(family, source, descriptors = {}) {
      this.family = family;
      this.source = source;
      this.style = descriptors.style ?? "normal";
      this.weight = descriptors.weight ?? "400";
      this.stretch = descriptors.stretch ?? "normal";
      this.display = descriptors.display ?? "swap";
      this.unicodeRange = descriptors.unicodeRange ?? "U+0-10FFFF";
      this.status = "loaded";
    }

    async load() {
      return this;
    }
  };
}

function defineTemporaryGlobal(modifiedGlobals, key, descriptor) {
  modifiedGlobals.push({
    key,
    hadOwnProperty: Object.prototype.hasOwnProperty.call(globalThis, key),
    previousDescriptor: Object.getOwnPropertyDescriptor(globalThis, key)
  });

  Object.defineProperty(globalThis, key, {
    ...descriptor,
    configurable: true
  });
}

async function withBrowserGlobals(run) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://example.com/"
  });
  const modifiedGlobals = [];

  for (const key of Reflect.ownKeys(dom.window)) {
    if (key in globalThis) {
      continue;
    }

    defineTemporaryGlobal(modifiedGlobals, key, Object.getOwnPropertyDescriptor(dom.window, key));
  }

  defineTemporaryGlobal(modifiedGlobals, "devicePixelRatio", {
    value: 1,
    writable: true
  });
  defineTemporaryGlobal(modifiedGlobals, "FontFace", {
    value: createFontFaceStub(),
    writable: true
  });

  if (!document.fonts) {
    document.fonts = {
      add() {},
      ready: Promise.resolve()
    };
  }

  try {
    return await run();
  } finally {
    for (const entry of modifiedGlobals.reverse()) {
      if (entry.hadOwnProperty && entry.previousDescriptor) {
        Object.defineProperty(globalThis, entry.key, entry.previousDescriptor);
      } else {
        delete globalThis[entry.key];
      }
    }
  }
}

async function ensureRuntime() {
  if (!exportUtilsPromise) {
    exportUtilsPromise = withBrowserGlobals(() => import("@excalidraw/utils"));
  }

  return exportUtilsPromise;
}

async function walkFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

export function getDiagramDirectories(docsRoot) {
  return {
    diagramsDir: path.join(docsRoot, "assets", "diagrams"),
    imagesDir: path.join(docsRoot, "assets", "images")
  };
}

export function isExcalidrawSource(filePath, directories) {
  return filePath.startsWith(directories.diagramsDir) && filePath.endsWith(EXCALIDRAW_SUFFIX);
}

export function getSvgOutputPath(sourcePath, directories) {
  const relativePath = path.relative(directories.diagramsDir, sourcePath);
  const svgRelativePath = relativePath.replace(/\.excalidraw\.json$/, ".svg");
  return path.join(directories.imagesDir, svgRelativePath);
}

export async function exportExcalidrawFile(sourcePath, directories) {
  const { exportToSvg } = await ensureRuntime();
  const raw = await fs.readFile(sourcePath, "utf8");
  const diagram = JSON.parse(raw);
  const svg = await withBrowserGlobals(() =>
    exportToSvg({
      elements: diagram.elements ?? [],
      appState: {
        viewBackgroundColor: "#ffffff",
        exportBackground: true,
        ...(diagram.appState ?? {})
      },
      files: diagram.files ?? {}
    })
  );

  const outputPath = getSvgOutputPath(sourcePath, directories);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${svg.outerHTML}\n`, "utf8");
  return outputPath;
}

export async function removeGeneratedSvg(sourcePath, directories) {
  const outputPath = getSvgOutputPath(sourcePath, directories);
  await fs.rm(outputPath, { force: true });
  return outputPath;
}

export async function exportAllExcalidrawFiles(docsRoot) {
  const directories = getDiagramDirectories(docsRoot);
  let files = [];

  try {
    files = await walkFiles(directories.diagramsDir);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const sources = files.filter((filePath) => isExcalidrawSource(filePath, directories));
  const outputs = [];

  for (const sourcePath of sources) {
    outputs.push(await exportExcalidrawFile(sourcePath, directories));
  }

  return outputs;
}
