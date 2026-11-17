# Siyam Ahmed — Portfolio

Static site: HTML, CSS and native ES modules. Three.js loads from a CDN for the hero only. No build step.
(If you already have a README in your repo, merge this into it instead of overwriting.)

## Run locally
    python -m http.server 8000      # then open http://localhost:8000
ES modules do not load from file://, so use a local server.

## Update content (everything lives in /data)
- `projects.js`: add an object to the array (template inside). Empty array shows the empty state.
- `exercises.js`: add an object per exercise. `topics` controls the filter buttons.
- `skills.js`: add items under a group with status Learning, Practicing, Building or Completed.
- `journey.js`: add milestones. `profile.js`: LinkedIn, email, interests.

## Add before publishing
- `assets/portrait.jpg` (4:5, under 300 KB). Until then a labelled placeholder shows.
- LinkedIn URL and email in `data/profile.js` (currently null, shown as "To be added").

## Deploy (GitHub Pages)
1. Put these files at the root of the `almustasim.github.io` repository and push to `main`.
2. Settings > Pages > Deploy from a branch > `main` / root.
3. Open https://almustasim.github.io after the build finishes.
