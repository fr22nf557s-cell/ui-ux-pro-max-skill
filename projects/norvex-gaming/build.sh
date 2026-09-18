#!/usr/bin/env bash
# Assemble the publishable site into _site/: the pages plus assets, nothing else.
# Used by the Cloudflare Worker build (bash build.sh, assets directory _site) and by the
# GitHub Pages workflow. Run it locally to see exactly what ships.
set -euo pipefail
cd "$(dirname "$0")"
PAGES="index.html shop.html product.html order.html help.html about.html legal.html 404.html manage.html"
SITE_URL="https://norvexgaming.com"
# refuse to build from a broken catalogue (a typo in the GitHub editor must not blank the live shop)
node scripts/check-catalog.mjs
rm -rf _site
mkdir -p _site/assets/img
cp $PAGES _site/
cp -r assets/css assets/js assets/fonts _site/assets/
cp site.webmanifest _site/
cp assets/img/*.svg assets/img/*.png assets/img/*.jpg _site/assets/img/
cp -r assets/img/products _site/assets/img/
[ -f CNAME ] && cp CNAME _site/ || true
# Cache-busting: every deploy gets a fresh version tag on the stylesheet and scripts, so shoppers
# never see a stale catalogue (prices, stock, checkout settings) after a push.
rev="$(git rev-parse --short HEAD 2>/dev/null || date -u +%Y%m%d%H%M)"
for f in $PAGES; do
  sed -i.bak -e "s#assets/css/norvex.css\"#assets/css/norvex.css?v=$rev\"#" -e "s#assets/css/manage.css\"#assets/css/manage.css?v=$rev\"#" -e "s#assets/css/fonts.css\"#assets/css/fonts.css?v=$rev\"#" -e "s#assets/js/catalog.js\"#assets/js/catalog.js?v=$rev\"#" -e "s#assets/js/norvex.js\"#assets/js/norvex.js?v=$rev\"#" -e "s#assets/js/manage.js\"#assets/js/manage.js?v=$rev\"#" "_site/$f"
done
rm -f _site/*.bak
printf '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)\n/assets/img/products/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/*\n  Cache-Control: public, max-age=86400\n/*.html\n  Cache-Control: public, max-age=300\n' > _site/_headers
# robots + sitemap: every indexable page and every product, nothing private (order pages, 404)
printf 'User-agent: *\nDisallow: /order.html\nDisallow: /manage.html\nAllow: /\nSitemap: %s/sitemap.xml\n' "$SITE_URL" > _site/robots.txt
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for f in "" shop.html help.html about.html legal.html; do echo "  <url><loc>$SITE_URL/$f</loc></url>"; done
  node -e "const w={}; new Function('window', require('fs').readFileSync('assets/js/catalog.js','utf8'))(w); for (const p of w.NORVEX_DATA.products) if (!p.hidden) console.log('  <url><loc>$SITE_URL/product.html?id=' + p.id + '</loc></url>')" 
  echo '</urlset>'
} > _site/sitemap.xml
echo "site: $(du -sh _site | cut -f1), $(find _site -type f | wc -l) files, $(grep -c '<url>' _site/sitemap.xml) sitemap urls"
