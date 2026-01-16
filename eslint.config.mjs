/*!
 * © World Data Exchange. All rights reserved.
 */

import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import js from "@eslint/js";
import headers from "eslint-plugin-headers";

export default [
    {
        ignores: ["**/coverage", "**/dist", "**/docs", "**/documents"],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },

    eslintPluginUnicorn.configs["recommended"],
    eslintPluginPrettier,
    {
        plugins: {
            headers,
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    blockPrefix: "!\n",
                    content: "© World Data Exchange. All rights reserved.",
                },
            ],
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/no-unnecessary-type-conversion": "off",
            "unicorn/prevent-abbreviations": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-node-protocol": "off",
            "prettier/prettier": "warn",
        },
    },
];
