#!/usr/bin/env bash
# Assemble the publishable site into _site/: the pages plus assets, nothing else.
# Used by the Cloudflare Worker build (bash build.sh, assets directory _site) and by the
# GitHub Pages workflow. Run it locally to see exactly what ships.
set -euo pipefail
cd "$(dirname "$0")"
PAGES="index.html shop.html product.html order.html help.html about.html legal.html 404.html"
SITE_URL="https://norvexgaming.com"
rm -rf _site
mkdir -p _site/assets/img
cp $PAGES _site/
cp -r assets/css assets/js _site/assets/
cp assets/img/*.svg assets/img/*.png _site/assets/img/
cp -r assets/img/products _site/assets/img/
[ -f CNAME ] && cp CNAME _site/ || true
# Cache-busting: every deploy gets a fresh version tag on the stylesheet and scripts, so shoppers
# never see a stale catalogue (prices, stock, checkout settings) after a push.
rev="$(git rev-parse --short HEAD 2>/dev/null || date -u +%Y%m%d%H%M)"
for f in $PAGES; do
  sed -i.bak -e "s#assets/css/norvex.css\"#assets/css/norvex.css?v=$rev\"#" -e "s#assets/js/catalog.js\"#assets/js/catalog.js?v=$rev\"#" -e "s#assets/js/norvex.js\"#assets/js/norvex.js?v=$rev\"#" "_site/$f"
done
rm -f _site/*.bak
printf '/assets/img/products/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*\n  Cache-Control: public, max-age=86400\n/*.html\n  Cache-Control: public, max-age=300\n' > _site/_headers
# robots + sitemap: every indexable page and every product, nothing private (order pages, 404)
printf 'User-agent: *\nDisallow: /order.html\nAllow: /\nSitemap: %s/sitemap.xml\n' "$SITE_URL" > _site/robots.txt
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for f in "" shop.html help.html about.html legal.html; do echo "  <url><loc>$SITE_URL/$f</loc></url>"; done
  grep -o '"id": "[^"]*"' assets/js/catalog.js | sed -e 's/"id": "//' -e 's/"$//' | sort -u | while read -r id; do echo "  <url><loc>$SITE_URL/product.html?id=$id</loc></url>"; done
  echo '</urlset>'
} > _site/sitemap.xml
echo "site: $(du -sh _site | cut -f1), $(find _site -type f | wc -l) files, $(grep -c '<url>' _site/sitemap.xml) sitemap urls"
