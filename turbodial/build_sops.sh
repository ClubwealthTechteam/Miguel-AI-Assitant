#!/usr/bin/env bash
# Builds the SOP PDFs. Usage: ./build_sops.sh   (run from the turbodial folder)
set -euo pipefail
cd "$(dirname "$0")"
for doc in ${@:-TD2_SOP_Admins TD2_SOP_Agents TD2_Rollout_Plan TD2_Phone_Number_List}; do
  footer=$(grep -m1 '^footer:' "$doc.md" | sed 's/^footer: *//')
  pandoc "$doc.md" -f markdown -t html5 -s --template sop_template.html -o "$doc.html"
  node -e '
const { chromium } = require("playwright");
(async()=>{const [,html,pdf,footer]=process.argv;const b=await chromium.launch();const p=await b.newPage();
await p.goto("file://"+html,{waitUntil:"load"});
await p.pdf({path:pdf,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true,headerTemplate:"<span></span>",
footerTemplate:`<div style="font-size:7.5pt;width:100%;padding:0 16mm;display:flex;justify-content:space-between;color:#5b6675;font-family:Segoe UI,Arial"><span>${footer}</span><span>Page <span class=pageNumber></span> of <span class=totalPages></span></span></div>`});
await b.close();})();' "$PWD/$doc.html" "$PWD/$doc.pdf" "$footer"
  rm -f "$doc.html"
  echo "built $doc.pdf"
done
