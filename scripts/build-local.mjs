import { spawn } from "child_process";
import { copyToObsidian } from "./copyToObsidian.mjs";

function run(name, cmd, args = []) {
  return new Promise((resolve) => {
    console.log(`\n=== ${name} ===`);

    const p = spawn(cmd, args, {
      stdio: "inherit",
    });

    p.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${name} passed`);
        resolve(true);
      } else {
        console.log(`❌ ${name} failed`);
        resolve(false);
      }
    });
  });
}

const ok1 = await run("TypeScript typecheck", "npx", ["tsc", "--noEmit", "--skipLibCheck"]);
const ok2 = ok1 && await run("TS bundle", "node", ["esbuild.config.mjs", "production"]);
const ok3 = ok2 && await run("CSS bundle", "node", ["scripts/build-styles.mjs", "production"]);

if (ok1 && ok2 && ok3) {
  console.log("\nAll steps succeeded → syncing to Obsidian");
  const synced = await copyToObsidian();
  process.exit(synced ? 0 : 1);
} else {
  console.log("\n=== BUILD FAILED ===");
  process.exit(1);
}
