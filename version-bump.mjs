import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

const manifestPath = "manifest.json";
const versionsPath = "versions.json";

// update manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// update versions.json
let versions = {};
if (fs.existsSync(versionsPath)) {
  versions = JSON.parse(fs.readFileSync(versionsPath, "utf8"));
}

versions[version] = manifest.minAppVersion || "0.15.0";

fs.writeFileSync(versionsPath, JSON.stringify(versions, null, 2));

console.log(`Version bumped to ${version}`);
