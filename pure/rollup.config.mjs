import typescript from 'rollup-plugin-typescript2';
import { dts } from "rollup-plugin-dts"

let targets = [
  { dir: './dist', tsconfig: "./tsconfig.json" },
  { dir: './es5', tsconfig: "./tsconfig.es5.json" }
]
// let formats = ['amd', 'cjs', 'es', 'iife', 'system', 'umd', 'commonjs', 'esm', 'module', 'systemjs']
let formats = ['module']
const configs = [];
if (process.argv.indexOf('-w') !== -1) {
  targets = [{ dir: 'dist', tsconfig: "./tsconfig.json" }]
  formats = ['module']
}
for (const format of formats) {
  for (const { dir, tsconfig } of targets) {
    const bundle_js_config = {
      input: 'src/index.ts',
      output: {
        file: `${dir}/${format}/index.js`,
        format,
        sourcemap: true,
        name: "index"
      },
      plugins: [
        typescript({ tsconfig })
      ],
    }
    const bundle_dts_config = {
      input: 'src/index.ts',
      output: {
        file: `${dir}/${format}/index.d.ts`,
        format
      },
      plugins: [dts()],
    }
    configs.push(bundle_js_config, bundle_dts_config)
  }
}

export default configs