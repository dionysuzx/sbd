# SBD progress

Training-log site for squat, bench, and deadlift, published at https://sbd.wtf.

## Editable data

- Main lifts: the `rows` list in `build.py`
- Accessories: `accessories_data.csv`. A new accessory also needs a display name in `ACC_NAMES` in `build.py` and an entry in `ACC_VARIATIONS` in `schema.py`.
- Accessory charts: only lifts listed in `ACTIVE_ACCESSORIES` in `build.py` get a chart. All logged rows still appear under All sessions → Accessories.
- Allowed lifts, variations, and sources: `schema.py`

`python3 build.py` rebuilds `final_data.csv`, `site/index.html`, and `site/index_deploy.html` (Chart.js inlined). Those generated files are not committed.

## Deploy

Push to `main`, or run **Deploy to GitHub Pages** from the Actions tab (`workflow_dispatch`).

The workflow runs `python3 build.py`, copies the inlined page to `_site/index.html` with the `CNAME`, and deploys that folder. Later pages can live under `site/` and be copied into `_site/` the same way.

## DNS

David adds these at the registrar:

- Apex `sbd.wtf`: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (optional AAAA records too)
- `www`: CNAME to `dionysuzx.github.io`
