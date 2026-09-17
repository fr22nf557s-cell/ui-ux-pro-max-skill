# Norvex Property — hosted film site (Higgsfield scroll-scrub build)

Source files for the hosted version of the Norvex Property site, where the
visitor's scroll plays a generated 24-second film of the flagship listing
(a glass-and-cedar manor on the ridge above Jackson, Wyoming): dawn aerial,
descending orbit, glide to the front door, through the door into the
double-height living room, hold on the Teton view.

These files drop into a Higgsfield `scroll-scrub` website repo, which ships
the scrub engine (`app/src/components/scroll-scrub/`):

| File | Purpose |
|---|---|
| `app/design-brief.md` | Phase-0 brief: brand, journey, chapters, budgets |
| `app/src/scroll-scrub-scenes.ts` | Theme tokens + six chapter scenes, one per film segment |
| `app/src/routes/index.tsx` | The page: header, `<ScrollScrub />`, listings, calculators, surveys, enquiry, footer |
| `app/src/norvex.css` | Page chrome and chapter typography |
| `encode-film.sh` | Cuts the take into six frame-exact segments (desktop + mobile) and posters |

The film itself (`app/public/assets/world/manor-0N*.mp4|jpg`) is generated on
Higgsfield and encoded with `encode-film.sh`; it is not committed here.
