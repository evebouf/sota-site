# TODOS

## Architectural Constraint: Additive Only
All homepage development is additive. D0-D11 explorations, PageOne, PageTwo, Glossary, App.tsx, and index.css remain untouched. Homepage.tsx and src/worlds/ are the only implementation surface for the hover worlds homepage.

## Asset Compression (prerequisite for hover worlds)
Compress all homepage-relevant assets in /public to WebP format, max 200KB each. Audit which assets are needed for the 7 worlds vs. which are exploration-only. Do NOT delete any existing assets — create compressed copies if needed. Current total: 41MB. Target: launch-tier worlds (Grecofuturism, Ferlinghetti, Alcatraz) assets under 500KB combined after compression.
