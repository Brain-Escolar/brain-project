import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // Regras baseadas no prettier.config.js
      semi: ["error", "always"], // Sempre usar ponto e vírgula
      quotes: ["error", "double"], // Usar aspas duplas (singleQuote: false)
      "comma-dangle": ["error", "always-multiline"], // Vírgula no final (trailingComma: 'all')
      // indent: ["error", 2], // Indentação de 2 espaços (tabWidth: 2)
      "object-curly-spacing": ["error", "always"], // Espaço entre chaves (bracketSpacing: true)
      "arrow-parens": ["error", "always"], // Sempre parênteses em arrow functions (arrowParens: 'always')
      "eol-last": ["error", "always"], // Quebra de linha no final do arquivo (endOfLine: 'lf')
      "jsx-quotes": ["error", "prefer-double"], // Aspas duplas no JSX (jsxSingleQuote: false)

      // Regras adicionais de formatação para consistência
      "no-trailing-spaces": "error", // Remover espaços em branco no final das linhas
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }], // Máximo 1 linha em branco
      "comma-spacing": ["error", { before: false, after: true }], // Espaçamento após vírgulas
      "key-spacing": ["error", { beforeColon: false, afterColon: true }], // Espaçamento em objetos
      "space-before-blocks": "error", // Espaço antes de blocos
      "keyword-spacing": "error", // Espaçamento ao redor de palavras-chave
    },
  },
];

export default eslintConfig;
