import esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";

const prod = process.argv[2] === "production";
const root = process.cwd();
// const root = path.resolve(import.meta.dirname);

const HEADER = `/*
Obsidian Quick Create Menu - Plugin for Obsidian
Copyright (c) 2025-2026 Kanha Padhan

GENERATED FILE - DO NOT EDIT styles.css
Edit sources in src/styles/*
*/
`;

const annotateCssPlugin = {
  name: "annotate-css",
  setup(build) {

    build.onEnd(async (result) => {
      if (result.errors.length) return;

      const outFile = path.join(root, "dist/styles.css");

      let css;
      try {
        css = await fs.readFile(outFile, "utf8");
      } catch {
        return;
      }

      /* prevent double header during watch */
      if (css.startsWith("/*\nObsidian Quick")) return;

      const finalCss = HEADER + "\n" + css;

      await fs.writeFile(outFile, finalCss, "utf8");

      console.log("✔ styles.css built");
    });

  },
};

const ctx = await esbuild.context({
  entryPoints: [path.join(root, "src/styles/index.css")],
  bundle: true,
  outfile: "dist/styles.css",

  minify: false,
  sourcemap: prod ? false : true,
  logLevel: "info",

  plugins: [annotateCssPlugin],
});

if (prod) {
  await ctx.rebuild();
  await ctx.dispose();
} else {
  await ctx.watch();
}
