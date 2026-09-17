#!/usr/bin/env bash
# Cut the single 24s take into six frame-exact segments for the scroll-scrub
# engine and write desktop + mobile encodes plus first-frame posters.
#   bash encode-film.sh source.mp4 app/public/assets/world
# Desktop: native res, H.264 yuv420p, CRF 20, GOP 8, no scene-cut keyframes,
# audio removed, faststart.  Mobile: 720p, CRF 23, GOP 4.  Posters are taken
# from the ENCODED clips so they match the first decoded frame exactly.
set -euo pipefail
SRC="$1"; OUT="$2"; mkdir -p "$OUT"
CUTS=(0 4 10 15 20 22.5 24)
for i in 1 2 3 4 5 6; do
  s=${CUTS[$((i-1))]}; e=${CUTS[$i]}
  if [ "$i" -eq 6 ]; then d=30; else d=$(awk -v a="$s" -v b="$e" 'BEGIN{printf "%.3f", b-a}'); fi
  ffmpeg -y -loglevel error -ss "$s" -t "$d" -i "$SRC" -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
    -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$OUT/manor-0$i.mp4"
  ffmpeg -y -loglevel error -ss "$s" -t "$d" -i "$SRC" -an -vf "scale=-2:720" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart "$OUT/manor-0$i-mobile.mp4"
  ffmpeg -y -loglevel error -i "$OUT/manor-0$i.mp4" -frames:v 1 -q:v 2 "$OUT/manor-0$i-poster.jpg"
  ffmpeg -y -loglevel error -i "$OUT/manor-0$i-mobile.mp4" -frames:v 1 -q:v 2 "$OUT/manor-0$i-mobile-poster.jpg"
done
echo "desktop bytes: $(cat "$OUT"/manor-0?.mp4 | wc -c)"
echo "mobile bytes:  $(cat "$OUT"/manor-0?-mobile.mp4 | wc -c)"
ls -la "$OUT"
