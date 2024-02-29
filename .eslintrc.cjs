/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: ["plugin:vue/vue3-essential", "plugin:vuetify/base", "eslint:recommended", "@vue/eslint-config-typescript"],
  plugins: ["prettier", "@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    quotes: ["warn", "double"],
    semi: ["warn", "always"],
    "prettier/prettier": [
      "warn",
      {
        semi: true,
        trailingComma: "none",
        singleQuote: false,
        printWidth: 120
      }
    ],
    "comma-dangle": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "vue/multiline-html-element-content-newline": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/max-attributes-per-line": "off",
    "vue/no-unused-vars": "warn",
    "vue/html-self-closing": "off"
  }
};
