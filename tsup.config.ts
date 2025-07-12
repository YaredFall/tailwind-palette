import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    treeshake: "recommended",
    sourcemap: true,
    clean: true,
    minify: true,
    outDir: "dist",
});
