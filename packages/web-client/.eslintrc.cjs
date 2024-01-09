module.exports = {
  root: true,
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig*.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/build/**/*", // Ignore built files.
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  rules: {
    "import/no-unresolved": 0,
    "max-len": 0,
    "require-jsdoc": 0,
    "valid-jsdoc": 0,
    "no-debugger": 0,
    "ban-ts-comment": 0,
  },
};
