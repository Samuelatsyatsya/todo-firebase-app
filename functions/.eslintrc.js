module.exports = {
  env: {
    node: true, // ✅ allows Node.js global variables like require, module, exports
    es2021: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    // optional: allow console.logs and unused vars starting with underscore
    "no-console": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
};
