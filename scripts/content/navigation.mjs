import fs from "node:fs";
import path from "node:path";

const TITLE_OVERRIDES = {
  modul: "Modul",
  jsgame: "JSGame",
  initBBZGame: "initBBZGame",
  isColliding: "isColliding",
  isKeyPressed: "isKeyPressed",
  moveElement: "moveElement",
  setPosition: "setPosition"
};

const SECTION_ENTRY_ORDER = {
  jsgame: [
    "getting-started.md",
    "initBBZGame.md",
    "setPosition.md",
    "moveElement.md",
    "isColliding.md",
    "isKeyPressed.md"
  ]
};

function stripNumericPrefix(segment) {
  return segment.replace(/^\d+(?:-\d+)*-(.+)$/i, "$1");
}

function normalizeGerman(value) {
  return value
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function slugifySegment(value) {
  return normalizeGerman(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function humanizeName(name) {
  const withoutExtension = name.replace(/\.md$/i, "").trim();

  if (TITLE_OVERRIDES[withoutExtension]) {
    return TITLE_OVERRIDES[withoutExtension];
  }

  if (withoutExtension.includes(" - ")) {
    return withoutExtension.replace(/\s+/g, " ").trim();
  }

  const normalized = withoutExtension
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getEntryOrder(sectionSlug, relativeDir, entryName) {
  if (relativeDir !== "") {
    return Number.POSITIVE_INFINITY;
  }

  const order = SECTION_ENTRY_ORDER[sectionSlug];

  if (!order) {
    return Number.POSITIVE_INFINITY;
  }

  const index = order.indexOf(entryName);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function sortEntries(entries, sectionSlug = null, relativeDir = "") {
  return entries.sort((left, right) => {
    const leftOrder = getEntryOrder(sectionSlug, relativeDir, left.name);
    const rightOrder = getEntryOrder(sectionSlug, relativeDir, right.name);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name, "de-CH", {
      numeric: true,
      sensitivity: "base"
    });
  });
}

function getTopLevelSections(contentRoot) {
  if (!fs.existsSync(contentRoot)) {
    return [];
  }

  return sortEntries(
    fs
      .readdirSync(contentRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  );
}

function toRouteSegments(relativePath) {
  return relativePath
    .split(path.sep)
    .filter(Boolean)
    .map((segment) => segment.replace(/\.md$/i, ""))
    .filter((segment, index, segments) => !(segment.toLowerCase() === "index" && index === segments.length - 1))
    .map((segment) => slugifySegment(segment))
    .filter(Boolean);
}

function toLink(sectionSlug, relativePath) {
  const segments = toRouteSegments(relativePath);
  return segments.length === 0 ? `/${sectionSlug}/` : `/${sectionSlug}/${segments.join("/")}`;
}

function stripNumericPrefixesFromRoute(routePath) {
  const hasTrailingSlash = routePath.endsWith("/");
  const segments = routePath.split("/").filter(Boolean).map(stripNumericPrefix);
  const rebuilt = `/${segments.join("/")}`;
  return hasTrailingSlash ? `${rebuilt}/` : rebuilt;
}

function registerAlias(aliasMap, aliasPath, canonicalPath) {
  if (aliasPath === canonicalPath) {
    return;
  }

  const existing = aliasMap.get(aliasPath);

  if (existing && existing !== canonicalPath) {
    aliasMap.set(aliasPath, null);
    return;
  }

  if (!existing) {
    aliasMap.set(aliasPath, canonicalPath);
  }
}

function toRewriteTarget(relativePath) {
  const [sectionName, ...rest] = relativePath.split(path.sep);
  const sectionSlug = slugifySegment(sectionName);
  const lastSegment = rest.at(-1) ?? "";
  const isIndexFile = lastSegment.toLowerCase() === "index.md";
  const withoutExtension = rest.map((segment) => segment.replace(/\.md$/i, ""));
  const cleaned = withoutExtension
    .filter((segment, index) => !(segment.toLowerCase() === "index" && index === withoutExtension.length - 1))
    .map((segment) => slugifySegment(segment))
    .filter(Boolean);

  if (cleaned.length === 0) {
    return `${sectionSlug}/index.md`;
  }

  return isIndexFile ? `${sectionSlug}/${cleaned.join("/")}/index.md` : `${sectionSlug}/${cleaned.join("/")}.md`;
}

function buildDirectoryItems(sectionSlug, absoluteDir, relativeDir = "") {
  const entries = sortEntries(
    fs
      .readdirSync(absoluteDir, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith(".")),
    sectionSlug,
    relativeDir
  );

  const items = [];
  const indexFile = path.join(absoluteDir, "index.md");
  const hasIndex = fs.existsSync(indexFile);
  const contentEntries = entries.filter(
    (entry) =>
      entry.isDirectory() || (entry.isFile() && entry.name.toLowerCase().endsWith(".md") && entry.name.toLowerCase() !== "index.md")
  );

  if (relativeDir === "") {
    items.push({ text: "Index", link: `/${sectionSlug}/` });
  }

  for (const entry of contentEntries) {
    if (entry.isFile()) {
      const relativeFile = path.join(relativeDir, entry.name);
      items.push({
        text: humanizeName(entry.name),
        link: toLink(sectionSlug, relativeFile)
      });
      continue;
    }

    const childRelativeDir = path.join(relativeDir, entry.name);
    const childAbsoluteDir = path.join(absoluteDir, entry.name);
    const childItems = buildDirectoryItems(sectionSlug, childAbsoluteDir, childRelativeDir);
    const childIndexPath = path.join(childAbsoluteDir, "index.md");
    const childTitle = humanizeName(entry.name);

    if (fs.existsSync(childIndexPath) && childItems.length === 1) {
      items.push({
        text: childTitle,
        link: toLink(sectionSlug, path.join(childRelativeDir, "index.md"))
      });
      continue;
    }

    if (fs.existsSync(childIndexPath)) {
      childItems.unshift({
        text: childTitle,
        link: toLink(sectionSlug, path.join(childRelativeDir, "index.md"))
      });
    }

    items.push({
      text: childTitle,
      collapsed: false,
      items: childItems
    });
  }

  if (relativeDir !== "" && hasIndex && contentEntries.length === 0) {
    return [
      {
        text: humanizeName(path.basename(absoluteDir)),
        link: toLink(sectionSlug, path.join(relativeDir, "index.md"))
      }
    ];
  }

  return items;
}

export function createContentNavigation({ docsRoot }) {
  const contentRoot = path.join(docsRoot, "content");
  const sections = getTopLevelSections(contentRoot);
  const nav = [];
  const sidebar = {};
  const rewrites = {};
  const aliasCandidates = new Map();

  for (const section of sections) {
    const sectionSlug = slugifySegment(section.name);
    const sectionTitle = TITLE_OVERRIDES[section.name] ?? humanizeName(section.name);
    const sectionDir = path.join(contentRoot, section.name);
    const sidebarItems = buildDirectoryItems(sectionSlug, sectionDir);

    nav.push({
      text: sectionTitle,
      link: `/${sectionSlug}/`
    });

    sidebar[`/${sectionSlug}/`] = [
      {
        text: sectionTitle,
        items: sidebarItems
      }
    ];

    const stack = [sectionDir];

    while (stack.length > 0) {
      const currentDir = stack.pop();
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }

        if (!entry.name.toLowerCase().endsWith(".md")) {
          continue;
        }

        const relativePath = path.relative(contentRoot, fullPath);
        const canonicalPath = toLink(sectionSlug, path.relative(sectionDir, fullPath));
        rewrites[path.join("content", relativePath).split(path.sep).join("/")] = toRewriteTarget(relativePath);
        registerAlias(aliasCandidates, stripNumericPrefixesFromRoute(canonicalPath), canonicalPath);
      }
    }
  }

  const linkAliases = new Map(
    Array.from(aliasCandidates.entries()).filter(([, canonicalPath]) => canonicalPath !== null)
  );

  return { nav, sidebar, rewrites, linkAliases };
}
