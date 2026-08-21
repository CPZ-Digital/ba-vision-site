# Graph Report - ba-vision-site  (2026-08-20)

## Corpus Check
- 2 files · ~241,234 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 27 nodes · 17 edges · 10 communities (3 shown, 7 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4188bc04`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Portfolio Bento Grid
- Services Section
- B&A Vision Logo
- Contact Form
- Hikvision Camera Array
- Wi-Fi Camera Setup
- Technician at Work
- About Section
- manifest.json
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Portfolio Bento Grid` - 3 edges
2. `Services Section` - 2 edges
3. `short_name` - 1 edges
4. `start_url` - 1 edges
5. `display` - 1 edges
6. `background_color` - 1 edges
7. `theme_color` - 1 edges
8. `orientation` - 1 edges
9. `icons` - 1 edges
10. `ASSETS` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Intelbras PoE Testing` --conceptually_related_to--> `Services Section`  [INFERRED]
  fotos/rio/VitaleOn 005.jpg → index.html
- `Network Rack Cabling` --conceptually_related_to--> `Services Section`  [INFERRED]
  fotos/rio/VitaleOn 007.jpg → index.html
- `B&A Vision Landing Page` --references--> `B&A Vision Logo`  [EXTRACTED]
  index.html → fotos/logo.PNG
- `Portfolio Bento Grid` --references--> `Batch Configuration Interface`  [EXTRACTED]
  index.html → fotos/bh/Obramax 002.jpg
- `Portfolio Bento Grid` --references--> `Industrial Warehouse Installation`  [EXTRACTED]
  index.html → fotos/contagem/Obramax 001.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vitale ON Project Implementation** — fotos_rio_vitaleon_001_jpg, fotos_rio_vitaleon_004_jpg, fotos_rio_vitaleon_005_jpg, fotos_rio_vitaleon_007_jpg [EXTRACTED 0.90]
- **Industrial Security Solutions** — fotos_contagem_obramax_001_jpg, fotos_bh_obramax_002_jpg, fotos_bh_obramax_005_jpg [INFERRED 0.85]

## Communities (10 total, 7 thin omitted)

### Community 0 - "Portfolio Bento Grid"
Cohesion: 0.50
Nodes (4): Batch Configuration Interface, Industrial Warehouse Installation, Vitale ON Condominium Promo, Portfolio Bento Grid

### Community 1 - "Services Section"
Cohesion: 0.67
Nodes (3): Intelbras PoE Testing, Network Rack Cabling, Services Section

### Community 8 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

## Knowledge Gaps
- **23 isolated node(s):** `name`, `short_name`, `description`, `start_url`, `display` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `Services Section` (e.g. with `Intelbras PoE Testing` and `Network Rack Cabling`) actually correct?**
  _`Services Section` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `description` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._