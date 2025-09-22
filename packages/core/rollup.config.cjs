const babel = require("@rollup/plugin-babel").default;
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve").default;
const esbuild =
  require("rollup-plugin-esbuild").default || require("rollup-plugin-esbuild");
const { terser } = require("rollup-plugin-terser");

const extensions = [".js", ".ts"];
const pkg = require("./package.json");

module.exports = {
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
      file: "dist/index.umd.js",
      format: "umd",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    esbuild({
      include: /\.(ts|tsx)$/,
      sourceMap: true,
      target: "es2015",
      tsconfig: "./tsconfig.json",
      minify: false,
    }),
    // Using esbuild for transpilation/minification so Babel and terser not required here
  ],
};
