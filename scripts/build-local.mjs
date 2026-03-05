import "./build.mjs";
import { copyToObsidian } from "./copyToObsidian.mjs";

async function run() {
  console.log("\n📦 Syncing to Obsidian...\n");

  const ok = await copyToObsidian();

  if (ok) {
    console.log("✔ Synced to Obsidian");
  } else {
    console.log("⚠ Sync skipped");
  }
}

run();
