import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "migrations/**",
      "node_modules/**",
      ".cursor/**",
      ".claude/**",
      ".agents/**",
      ".devin/**",
      ".pgdata/**",
      "src/prisma/contract.d.ts",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
);
