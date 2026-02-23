import esbuild from "esbuild";
import { getTSConfig, getStyleConfig } from "./esbuild.config.mjs";
import { copyToObsidian } from "./copyToObsidian.mjs";

const root = process.cwd();

async function run() {

  console.log("\n🏗 Production build\n");

  await esbuild.build(getTSConfig({ prod:true, root }));
  console.log("✔ TS built");

  await esbuild.build(getStyleConfig({ prod:true, root }));
  console.log("✔ CSS built");

  console.log("\n📦 Syncing to Obsidian...\n");
  const ok = await copyToObsidian();

  process.exit(ok ? 0 : 1);
}

run();