import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".ts"];
const pkg = require("./package.json");

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    {
      name: "SmartTVSDK",
      file: "dist/smart-tv-sdk.umd.js",
      format: "umd",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      tsconfigOverride: { compilerOptions: { declaration: false } },
    }),
    babel({
      extensions,
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              chrome: "36",
            },
            useBuiltIns: "usage",
            corejs: 3,
          },
        ],
      ],
    }),
    terser(),
  ],
};
