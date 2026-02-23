import esbuild from "esbuild";
import { getTSConfig, getStyleConfig } from "./esbuild.config.mjs";
import { copyToObsidian } from "./copyToObsidian.mjs";

const root = process.cwd();

let firstTS = false;
let firstCSS = false;
let initialSyncDone = false;
let syncing = false;
let buildNum = 0;

function line() {
  console.log("\n────────────────────────────────────");
}

async function sync(reason) {
  if (syncing) return;
  syncing = true;

  line();
  console.log(`📦 ${reason} → syncing...\n`);

  const ok = await copyToObsidian();
  console.log(ok ? "✅ Sync finished\n" : "❌ Sync failed\n");

  syncing = false;
}

async function onTS() {
  buildNum++;
  line();
  console.log(`🟦 TS built (#${buildNum})`);

  if (!initialSyncDone) {
    firstTS = true;
    if (firstTS && firstCSS) {
      initialSyncDone = true;
      await sync("Initial build ready");
    }
  } else {
    await sync("TS updated");
  }
}

async function onCSS() {
  console.log("🟩 CSS built");

  if (!initialSyncDone) {
    firstCSS = true;
    if (firstTS && firstCSS) {
      initialSyncDone = true;
      await sync("Initial build ready");
    }
  } else {
    await sync("CSS updated");
  }
}

console.log("\n🚀 Dev watcher started\n");

const tsBase = getTSConfig({ prod:false, root });

const tsCtx = await esbuild.context({
  ...tsBase,
  plugins: [
    ...(tsBase.plugins ?? []),
    {
      name: "ts-watch",
      setup(build){
        build.onEnd(r=>{
          if(!r.errors.length) onTS();
        });
      }
    }
  ]
});

await tsCtx.watch();

const cssBase = getStyleConfig({ prod:false, root });

const cssCtx = await esbuild.context({
  ...cssBase,
  plugins: [
    ...(cssBase.plugins ?? []),
    {
      name:"css-watch",
      setup(build){
        build.onEnd(r=>{
          if(!r.errors.length) onCSS();
        });
      }
    }
  ]
});

await cssCtx.watch();