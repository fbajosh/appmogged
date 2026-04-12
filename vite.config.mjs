import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function serveNotFoundPage() {
  async function handleNotFound(request, response, next, server) {
    if (!request.url || request.method !== "GET") {
      next();
      return;
    }

    const url = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const acceptHeader = request.headers.accept;
    const isHtmlNavigation =
      acceptHeader === undefined || acceptHeader.includes("text/html") || acceptHeader.includes("*/*");
    const isFileRequest = pathname.split("/").pop()?.includes(".");
    const sourcePath = resolve(server.config.root, `.${pathname}`);

    if (
      !isHtmlNavigation ||
      isFileRequest ||
      pathname === "/" ||
      pathname === "/index.html" ||
      pathname === "/404.html" ||
      pathname.startsWith("/@") ||
      existsSync(sourcePath)
    ) {
      next();
      return;
    }

    const notFoundHtml = await readFile(resolve(server.config.root, "404.html"), "utf8");
    const transformedHtml = await server.transformIndexHtml(request.url, notFoundHtml);
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/html");
    response.end(transformedHtml);
  }

  return {
    name: "serve-not-found-page",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleNotFound(request, response, next, server).catch(next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleNotFound(request, response, next, server).catch(next);
      });
    },
  };
}

export default defineConfig({
  plugins: [serveNotFoundPage()],
  root: "src",
  base: "/",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
    rollupOptions: {
      input: {
        index: resolve("src/index.html"),
        404: resolve("src/404.html"),
      },
    },
  },
});
