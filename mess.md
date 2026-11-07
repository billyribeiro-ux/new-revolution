cd ~/projects/lando-norris-clone

# 1. Patch reproduce_vanilla_stage1.ts to strip inline <style> blocks from index.html & purge empty CSS rulesets

node -e '
const fs = require("node:fs");
let code = fs.readFileSync("scripts/reproduce_vanilla_stage1.ts", "utf8");

// Strip empty CSS rulesets from rewrittenCss before writing styles.css
code = code.replace(
"await fs.writeFile(path.join(outDir, \x27styles.css\x27), rewrittenCss, \x27utf8\x27);",
"const cleanedCss = rewrittenCss.replace(/[^{};\\/]+\\{\\s*\\}/g, \x27\x27);\n await fs.writeFile(path.join(outDir, \x27styles.css\x27), cleanedCss, \x27utf8\x27);"
);

// Strip duplicate inline <style>...</style> blocks from rewrittenHtml
code = code.replace(
".replace(/<link\\b[^>]_rel=[\x27\"]stylesheet[\x27\"][^>]_>/gi, \x27\x27)",
".replace(/<link\\b[^>]_rel=[\x27\"]stylesheet[\x27\"][^>]_>/gi, \x27\x27)\n .replace(/<style\\b[^>]_>[\\s\\S]_?<\\/style>/gi, \x27\x27)"
);

fs.writeFileSync("scripts/reproduce_vanilla_stage1.ts", code, "utf8");
console.log("[PATCHED] reproduce_vanilla_stage1.ts updated to strip inline <style> & empty CSS rules.");
'

# 2. Re-run the Stage 1 Slicer + Local Media Mirror + 9-Point Offline Verification Gate

python3 scripts/digest_and_slice.py && pnpm run reproduce:stage1
