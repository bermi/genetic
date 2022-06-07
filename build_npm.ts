// Creates an npm package for use in Node.js.
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: "dev",
    domException: true,
    timers: true,
  },
  test: true,
  compilerOptions: {
    importHelpers: true,
    target: "ES2021",
  },
  package: {
    // package.json properties
    name: "@bermi/genetic",
    version: Deno.args[0],
    description: "Typescript Genetic Algorithm Framework.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/bermi/genetic.git",
    },
    engines: {
      node: ">=16.5.0 <18",
    },
    bugs: {
      url: "https://github.com/bermi/genetic/issues",
    },
    dependencies: {
      "tslib": "~2.3.1",
    },
    devDependencies: {
      "@types/node": "^16",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");

// export function isNode(): boolean {
//   return "process" in globalThis && "global" in globalThis;
// }
