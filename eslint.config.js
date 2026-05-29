const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        Audio: "readonly",
        POKEMON_DATA: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];
