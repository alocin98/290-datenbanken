import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportAllExcalidrawFiles } from "./export.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(scriptsDir, "..", "..", "docs");
const outputs = await exportAllExcalidrawFiles(docsRoot);

if (outputs.length === 0) {
  console.log("No Excalidraw diagrams found.");
} else {
  for (const output of outputs) {
    console.log(`Exported ${path.relative(process.cwd(), output)}`);
  }
}
