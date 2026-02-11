import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import tsparser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js, obsidianmd },
    extends: ["js/recommended", "obsidianmd/recommended"],
    languageOptions: { 
      globals: globals.browser,
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
    },
    // rules: {
    //   "obsidianmd/commands/no-command-in-command-id": "error",
    //   "obsidianmd/settings/no-unused-setting": "warn",
    // }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
