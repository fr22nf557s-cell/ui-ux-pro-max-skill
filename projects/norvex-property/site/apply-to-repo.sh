#!/usr/bin/env bash
# Apply the Norvex Property site sources to a cloned Higgsfield scroll-scrub
# repo, encode the film into it, and prepare metadata. No credentials needed.
#   bash apply-to-repo.sh /path/to/cloned/repo <film-url>
set -euo pipefail
REPO="$1"; FILM_URL="$2"
RAW="https://raw.githubusercontent.com/fr22nf557s-cell/ui-ux-pro-max-skill/claude/jolly-galileo-tyb247/projects/norvex-property/site"
cd "$REPO"
for f in app/design-brief.md app/src/scroll-scrub-scenes.ts app/src/routes/index.tsx app/src/norvex.css app/public/favicon.svg app/public/site.webmanifest; do
  mkdir -p "$(dirname "$f")"; curl -fsSL "$RAW/$f" -o "$f"
done
curl -fsSL "$RAW/encode-film.sh" -o /tmp/encode-film.sh
curl -fsSL "$RAW/make-icons.py" -o /tmp/make-icons.py
[ -f /tmp/film.mp4 ] || curl -fsSL "$FILM_URL" -o /tmp/film.mp4
bash /tmp/encode-film.sh /tmp/film.mp4 app/public/assets/world
python3 /tmp/make-icons.py app/public
# app-meta.json: fill the card fields (feed listing stays unpublished)
python3 - <<'PY'
import json, pathlib
p = pathlib.Path('app/src/app-meta.json')
meta = json.loads(p.read_text()) if p.exists() else {}
meta.update({
  "og_title": "Norvex Property",
  "og_description": "Buy, let, sell, finance and survey with one quiet, exact team.",
  "og_image_url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3JSm3zkWdJl0vDJbWVyyAb7NnDy/8945142b-e935-4985-af64-7b8c2de51e52.png",
  "marketplace_cover_url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3JSm3zkWdJl0vDJbWVyyAb7NnDy/373b5d9f-98ca-46b4-a00a-924bf280109c.png",
})
p.write_text(json.dumps(meta, indent=2) + "\n")
print("app-meta.json:", json.dumps(meta, indent=2))
PY
# CSP: media-src must allow blob:
echo "== CSP media-src occurrences"; grep -rn "media-src" app --include='*.ts' --include='*.tsx' --include='*.jsonc' --include='*.json' --include='*.toml' --include='*.txt' -l --exclude-dir=node_modules --exclude-dir=packages || echo "(none found: check __root.tsx / server.ts headers)"
grep -rn "media-src" app --exclude-dir=node_modules --exclude-dir=packages | grep -v "blob:" || true
echo "== placeholders / dashes / branding gate"
grep -rniE 'lorem ipsum|REMOVE_THIS|blank-app-v1' app/src/ || echo "no placeholders"
grep -rn "—\|–" app/src/routes app/src/scroll-scrub-scenes.ts app/src/norvex.css || echo "no dashes"
grep -rin "higgsfield\|quanta" app/src/routes app/src/scroll-scrub-scenes.ts app/src/norvex.css || echo "no branding"
echo "== assets"; ls app/public/assets/world | wc -l; du -ch app/public/assets/world/*.mp4 | tail -1
git status --short | head -40
