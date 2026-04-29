import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, "docs", "projects");
const destinationRoot = path.join(repoRoot, "docs", "assets", "zips");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function createArchive(sourceDir, outputFile, entryName) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputFile);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, entryName);
    archive.finalize();
  });
}

async function main() {
  if (!(await fileExists(sourceRoot))) {
    console.log(`No zip source directory found at ${sourceRoot}.`);
    return;
  }

  await fs.mkdir(destinationRoot, { recursive: true });

  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
  const directoryNames = new Set(directories.map((entry) => entry.name));
  const destinationEntries = await fs.readdir(destinationRoot, { withFileTypes: true });

  for (const entry of destinationEntries) {
    if (!entry.isFile() || !entry.name.endsWith(".zip")) {
      continue;
    }

    const baseName = entry.name.slice(0, -4);

    if (!directoryNames.has(baseName)) {
      await fs.unlink(path.join(destinationRoot, entry.name));
    }
  }

  for (const entry of directories) {
    const sourceDir = path.join(sourceRoot, entry.name);
    const outputFile = path.join(destinationRoot, `${entry.name}.zip`);

    await fs.rm(outputFile, { force: true });
    await createArchive(sourceDir, outputFile, entry.name);
    console.log(`Created ${path.relative(repoRoot, outputFile)}`);
  }

  if (directories.length === 0) {
    console.log(`No subdirectories found in ${path.relative(repoRoot, sourceRoot)}.`);
  }
}

await main();
