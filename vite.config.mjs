import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const landingLogoMarkup = '<img id="logo-front-image" src="/appmogged.svg" alt="AppMogged">';
const notFoundLogoMarkup = '<img id="logo-front-image" src="/404.svg" alt="404">';

function buildNotFoundHtml(indexHtml) {
  const notFoundHtml = indexHtml.replace(landingLogoMarkup, notFoundLogoMarkup);
  if (notFoundHtml === indexHtml) {
    throw new Error("Unable to generate 404.html because the landing logo markup was not found.");
  }

  return notFoundHtml;
}

function emitNotFoundPage() {
  let outputDirectory = "";

  return {
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    name: "emit-not-found-page",
    async writeBundle() {
      const indexHtml = await readFile(resolve(outputDirectory, "index.html"), "utf8");
      await writeFile(resolve(outputDirectory, "404.html"), buildNotFoundHtml(indexHtml), "utf8");
    },
  };
}

export default defineConfig({
  plugins: [emitNotFoundPage()],
  root: "src",
  base: "/",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
  },
});
