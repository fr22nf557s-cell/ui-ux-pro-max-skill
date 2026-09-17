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
# Cache-busting: every deploy gets a fresh version tag on the stylesheet and scripts, so shoppers
# never see a stale catalogue (prices, stock, checkout settings) after a push.
rev="$(git rev-parse --short HEAD 2>/dev/null || date -u +%Y%m%d%H%M)"
sed -i.bak -e "s#assets/css/norvex.css\"#assets/css/norvex.css?v=$rev\"#" -e "s#assets/js/catalog.js\"#assets/js/catalog.js?v=$rev\"#" -e "s#assets/js/norvex.js\"#assets/js/norvex.js?v=$rev\"#" _site/index.html _site/shop.html _site/product.html
rm -f _site/*.bak
printf '/assets/img/products/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*\n  Cache-Control: public, max-age=86400\n/*.html\n  Cache-Control: public, max-age=300\n' > _site/_headers
echo "site: $(du -sh _site | cut -f1), $(find _site -type f | wc -l) files"
