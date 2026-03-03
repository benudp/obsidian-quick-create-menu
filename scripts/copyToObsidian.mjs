import fs from "fs";
import path from "path";
import { cp, mkdir, readFile } from "fs/promises";

export async function getObsidianDir() {
  try {
    const env = JSON.parse(await readFile("env.json", "utf8"));
    if (!env.OBSIDIAN_PLUGIN_DIR)
      throw new Error("Missing OBSIDIAN_PLUGIN_DIR");
    return env.OBSIDIAN_PLUGIN_DIR;
  } catch (e) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "env.json missing or invalid. Sync disabled.",
    );
    return null;
  }
}

export async function copyToObsidian() {
  const obsidianDir = await getObsidianDir();
  if (!obsidianDir) return false;

  try {
    if (!fs.existsSync(obsidianDir)) {
      await mkdir(obsidianDir, { recursive: true });
    }

    const files = [
      ["dist/main.js", "main.js"],
      ["dist/styles.css", "styles.css"],
      ["manifest.json", "manifest.json"],
    ];

    console.log("Syncing to:", obsidianDir);
    for (const [from, to] of files) {
      const src = path.resolve(from);
      const dest = path.join(obsidianDir, to);

      if (fs.existsSync(src)) {
        await cp(src, dest);
      }
    }

    console.log("\x1b[32m%s\x1b[0m", "✔ Synced to Obsidian");
    return true;
  } catch (e) {
    console.error("\x1b[31m%s\x1b[0m", "Sync error:", e.message);
    return false;
  }
}
