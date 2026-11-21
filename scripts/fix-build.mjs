/**
 * Post-build step that makes the emitted modules loadable by Node's own resolvers (GH-147).
 *
 * `tsc` with `"moduleResolution": "node"` emits extensionless relative specifiers (`./locale`) and bare JSON
 * imports. Node's ESM resolver needs explicit extensions and import attributes for JSON, and the CJS build
 * (renamed to `*.cjs`) must require its `*.cjs` siblings rather than the ESM `*.js` ones. This script:
 *
 * - ESM (`*.js`, `*.d.ts`): `./x` -> `./x.js`, `./metadata/x.json` -> `./metadata/x.js` (an ESM wrapper);
 * - CJS (`*.cjs`, `*.d.cts`): `./x` -> `./x.cjs`, JSON requires are kept as is (CJS loads JSON natively);
 * - writes `*.d.cts` copies of the declarations for the `require` condition of the exports map.
 *
 * Kept dependency-free and compatible with Node 16, which the publish workflow uses.
 */

import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = fs.readdirSync(root).filter((f) => f.endsWith(".cjs")).map((f) => f.slice(0, -".cjs".length));

if (modules.length === 0) {
    console.error("fix-build: no *.cjs modules found, run `npm run build` first");
    process.exit(1);
}

const errors = [];
const jsonWrappers = new Set();

const ESM_SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']+)\2/g;
const CJS_SPECIFIER = /(\brequire\(\s*|\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']+)\2/g;

const resolveSpecifier = (file, specifier, flavor) => {
    if (/\.(c|m)?js$/.test(specifier)) return specifier;
    if (specifier.endsWith(".json")) {
        if (file.endsWith(".cjs")) return specifier;
        if (file.endsWith(".js")) {
            jsonWrappers.add(path.resolve(root, specifier));
            return specifier.replace(/\.json$/, ".js");
        }
        errors.push(`${file}: declarations must not reference JSON (${specifier})`);
        return specifier;
    }
    if (fs.existsSync(path.resolve(root, `${specifier}.cjs`))) return `${specifier}.${flavor}`;
    errors.push(`${file}: cannot resolve relative specifier ${specifier}`);
    return specifier;
}

const rewrite = (source, target, pattern, flavor) => {
    const code = fs.readFileSync(path.join(root, source), "utf8");
    const fixed = code.replace(pattern, (_, prefix, quote, specifier) => {
        return `${prefix}${quote}${resolveSpecifier(target, specifier, flavor)}${quote}`;
    });
    fs.writeFileSync(path.join(root, target), fixed);
}

for (const name of modules) {
    rewrite(`${name}.js`, `${name}.js`, ESM_SPECIFIER, "js");
    rewrite(`${name}.cjs`, `${name}.cjs`, CJS_SPECIFIER, "cjs");
    if (fs.existsSync(path.join(root, `${name}.d.ts`))) {
        rewrite(`${name}.d.ts`, `${name}.d.cts`, CJS_SPECIFIER, "cjs");
        rewrite(`${name}.d.ts`, `${name}.d.ts`, ESM_SPECIFIER, "js");
    }
}

for (const jsonPath of jsonWrappers) {
    if (!fs.existsSync(jsonPath)) {
        errors.push(`missing JSON module ${path.relative(root, jsonPath)}`);
        continue;
    }
    const data = JSON.stringify(JSON.parse(fs.readFileSync(jsonPath, "utf8")));
    fs.writeFileSync(jsonPath.replace(/\.json$/, ".js"), `export default ${data};\n`);
}

if (errors.length > 0) {
    errors.forEach((error) => console.error(`fix-build: ${error}`));
    process.exit(1);
}
