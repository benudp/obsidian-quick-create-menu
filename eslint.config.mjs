import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  obsidianmd.configs.recommended,
  {
    files: ["**/*.{ts,js}"],
    plugins: { obsidianmd },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    // rules: {
    //   "obsidianmd/commands/no-command-in-command-id": "error",
    //   "obsidianmd/settings/no-unused-setting": "warn",
    // },
  },
]);
