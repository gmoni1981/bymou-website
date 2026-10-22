# Localization progress
- Added `scripts/build-locales.py`: source HTML → /en, /fr, /it, /ar, shared assets, reciprocal hreflang/canonical, locale sitemap.
- Added `localization.js` / `.css`: URL-authoritative language switch preserving page/query/hash; Arabic RTL; `window.ByMouLocale` interface for dynamic components.
- Added all 510 Arabic dictionary keys, exact parity with existing English/French/Italian.
- Initial generation: 188 pages. Tools and draft cases noindexed/excluded sitemap.
- Pending: merge supplemental copy translations and regenerate after parent component edits. Initial audit in `localization-audit.json`; metadata/alt extras recorded `/private/tmp/bymou-meta.json`.
- Checks: Node syntax passes localization.js, editorial.js, work/selected-case.js; generator executes successfully.
- No deployment or commits performed by locale subtask.
