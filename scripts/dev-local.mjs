import { spawn } from "child_process";
import { copyToObsidian } from "./copyToObsidian.mjs";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function watch(name, cmd, args, successMatcher) {
  const p = spawn(cmd, args, {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let pendingSync = false;

  function handle(data) {
    const text = data.toString();
    process.stdout.write(text);

    if (successMatcher(text)) {
      if (!pendingSync) {
        pendingSync = true;
        setTimeout(async () => {
          await copyToObsidian();
          pendingSync = false;
        }, 50);
      }
    }
  }

  p.stdout.on("data", handle);
  p.stderr.on("data", (d) => process.stderr.write(d));

  p.on("close", (code) => {
    console.log(`\n${name} stopped (${code})`);
  });
}

watch(
  "TS Watch",
  "node",
  ["esbuild.config.mjs"],
  (t) =>
    t.includes("built") ||
    t.includes("rebuild") ||
    t.includes("watching") ||
    t.includes("done")
);

watch(
  "CSS Watch",
  "node",
  ["scripts/build-styles.mjs"],
  (t) =>
    t.includes("styles.css built") ||
    t.includes("built")
);
