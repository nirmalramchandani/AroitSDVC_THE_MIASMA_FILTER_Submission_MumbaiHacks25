// next.config.js

const { dirname } = require("path");
const { fileURLToPath } = require("url");
const { FlatCompat } = require("@eslint/eslintrc");

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "build/",
      "next-env.d.ts",
    ],
  },
];

module.exports = {
  // Disables ESLint checks during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Attach your eslint configuration so it works during local dev
  eslintConfig,
  // other Next.js config options can go here
};