import path from "node:path";
import {
  exportAllExcalidrawFiles,
  exportExcalidrawFile,
  getDiagramDirectories,
  isExcalidrawSource,
  removeGeneratedSvg
} from "./export.mjs";

export function createExcalidrawExportPlugin({ docsRoot }) {
  const directories = getDiagramDirectories(docsRoot);

  return {
    name: "local-excalidraw-export",
    async buildStart() {
      await exportAllExcalidrawFiles(docsRoot);
    },
    configureServer(server) {
      const logger = server.config.logger;

      exportAllExcalidrawFiles(docsRoot).catch((error) => {
        logger.error(`Failed to export Excalidraw diagrams: ${error.message}`);
      });

      const exportAndReload = async (filePath, action) => {
        if (!isExcalidrawSource(filePath, directories)) {
          return;
        }

        if (action === "unlink") {
          const removedPath = await removeGeneratedSvg(filePath, directories);
          logger.info(`Removed generated SVG ${path.relative(docsRoot, removedPath)}`);
        } else {
          const outputPath = await exportExcalidrawFile(filePath, directories);
          logger.info(`Exported ${path.relative(docsRoot, outputPath)}`);
        }

        server.ws.send({ type: "full-reload" });
      };

      const onAdd = (filePath) => {
        exportAndReload(filePath, "add").catch((error) => logger.error(error.message));
      };
      const onChange = (filePath) => {
        exportAndReload(filePath, "change").catch((error) => logger.error(error.message));
      };
      const onUnlink = (filePath) => {
        exportAndReload(filePath, "unlink").catch((error) => logger.error(error.message));
      };

      server.watcher.on("add", onAdd);
      server.watcher.on("change", onChange);
      server.watcher.on("unlink", onUnlink);

      return () => {
        server.watcher.off("add", onAdd);
        server.watcher.off("change", onChange);
        server.watcher.off("unlink", onUnlink);
      };
    }
  };
}
