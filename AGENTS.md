# DexPiano Project Page

## Scope

- This repository maintains only the DexPiano research project website.
- Website files live in `dist/`; no package installation or build is needed.
- Do not modify the separate DexPiano training repository as part of website maintenance.
- GitHub repository: `TyrionWuYue/DexPiano-Page`; default branch: `main`.
- GitHub Pages deploys `dist/` through `.github/workflows/pages.yml`.
- A push changing the website on `main` publishes it. Local edit requests do not by themselves authorize publishing; honor the user's requested scope.

## Design and content

- Prioritize comfortable typography, warm white backgrounds, readable contrast, spacing, and clear academic section hierarchy.
- Blue and coral are restrained accents. Elaborate sound or symbol design is not a priority.
- Keep the page responsive and use relative asset paths for GitHub Pages project subpaths.
- Preserve the author order: Wuyue, Kaizhe, Zhang Han, Chenyuan, Fred, Yao Xi, Zeyu, Tianming, Zhecheng, Fred's Professor, Wuyue Professor, Huazhe.
- Do not infer full names, affiliations, equal contributions, paper links, or experimental claims. Keep unavailable materials clearly marked until supplied.
- The interactive piano is a concept illustration, not a robot recording or measured experiment.
- Do not import training assets, local analysis, or private media without authorization.

## Validation

- For small content edits, inspect the changed content and relevant layout only.
- For JS edits, run `node --check dist/app.js` and verify affected interactions in a browser.
- Preview with `python3 -m http.server 8080 --bind 127.0.0.1 --directory dist`.
- For publication, verify the Actions deployment and the actual live page before reporting success.
