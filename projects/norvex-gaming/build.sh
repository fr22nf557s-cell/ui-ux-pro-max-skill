#!/usr/bin/env bash
# Assemble the publishable site into _site/: the three pages plus assets, nothing else.
# Used by Cloudflare Pages (build command: bash build.sh, output directory: _site) and by
# the GitHub Pages workflow. Run it locally to see exactly what ships.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf _site
mkdir -p _site/assets/img
cp index.html shop.html product.html _site/
cp -r assets/css assets/js _site/assets/
cp assets/img/*.svg _site/assets/img/
cp -r assets/img/products _site/assets/img/
[ -f CNAME ] && cp CNAME _site/ || true
printf '/assets/img/products/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*\n  Cache-Control: public, max-age=86400\n' > _site/_headers
echo "site: $(du -sh _site | cut -f1), $(find _site -type f | wc -l) files"
