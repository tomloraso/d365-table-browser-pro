# Marketing Prompts for Claude

Use these prompts in Claude (claude.ai). Attach the screenshots from the `images/` folder as indicated.

## Screenshots available (in images/ folder)

1. `Table Browser.png` — Side panel open alongside D365, showing Currency table data with the Browse tab
2. `OData query builder with multi legal entity capability.png` — Query tab with Currencies entity, all fields selected, cross-company checked, 28 rows returned in data grid
3. `OData Entity Fetch.png` — Entities tab loading metadata from environment
4. `Environment Selection.png` — Popup with environment dropdown showing TEST, UAT, PROD
5. `Environment configuration.png` — Options page with 3 environments configured (green/blue/red), About section
6. `Favourites.png` — Popup showing Favorites tab with 3 saved tables
7. `History.png` — Popup showing History tab with recent table lookups

---

## Prompt 1: Chrome Web Store Screenshots & Promotional Tile

Attach: ALL 7 images

```
I have a free browser extension for D365 Finance & Operations called "D365 F&O Table & OData Browser Pro". I need you to create promotional images for the Chrome Web Store listing.

Here are screenshots of the actual extension. Please use these real screenshots in the designs — don't mock up fake UI.

What the extension does:
- Search 15,815 D365 tables by name, open the Table Browser in one click
- Build OData queries visually — pick an entity, select fields, add filters, toggle cross-company
- View results in a sortable data grid, export to CSV/TSV/JSON
- Manage multiple D365 environments (Dev, UAT, Prod) with color coding
- Side panel mode so it sits alongside D365 while you work
- Uses your existing D365 session — no credentials stored, read-only

Please create:
1. A Chrome Web Store hero banner (1400x560) — clean white/light background, extension name on the left, 2-3 of the attached screenshots arranged on the right. Keep it simple and functional. No hype — just show what it does.
2. A small promotional tile (440x280) — extension name, the TB icon (indigo-to-blue gradient square with white "TB"), and a one-liner: "Search tables & query OData in D365 F&O"

Style: Clean, minimal, professional. White or very light background. This is a free utility tool, not a SaaS product — keep it understated.
```

---

## Prompt 2: LinkedIn Post Image

Attach: `Table Browser.png`, `OData query builder with multi legal entity capability.png`, `Environment Selection.png`

```
I'm posting on LinkedIn about a free browser extension I built for D365 F&O consultants. I need a simple image to go with the post.

Create a single LinkedIn image (1200x627) that shows:
- Left side: the extension name "D365 F&O Table & OData Browser Pro" and 3 short bullet points:
  - Search 15,800+ tables instantly
  - OData queries with cross-company
  - Export to CSV / Excel / JSON
- Right side: 2 of the attached screenshots, slightly overlapping, showing the extension in use

The attached screenshots show the real extension UI. Use them as-is, just frame them nicely.

Keep it clean and understated — white or light grey background. This is a free tool I'm sharing, not a product launch. No "game-changing" or "revolutionary" language. Just functional.
```

---

## Prompt 3: D365 Community Forum Post

Attach: `Table Browser.png`, `OData query builder with multi legal entity capability.png`

```
Write a short post for the Dynamics 365 Community forums about a free browser extension I built.

Extension: D365 F&O Table & OData Browser Pro
Attached are screenshots of the extension in use.

What it does:
- Search 15,815 D365 F&O tables by name (static list, no metadata loading needed)
- Open Table Browser in one click
- Visual OData Query Builder — pick entity, select fields, add filters, cross-company toggle
- Results in a sortable data grid with CSV/TSV/JSON export
- Multi-environment management with color-coded badges
- Side panel mode
- Uses existing D365 browser session — no credentials stored
- Free, works on Chrome and Edge

Tone: Helpful community member sharing something they made. Not salesy. Ask for feedback and suggestions. Be honest about limitations.

Include these known limitations:
- Table list is static (from v10.0.46) — custom/ISV tables won't appear in search but you can type any name manually
- OData queries are read-only
- Requires an active D365 session in the browser
- Metadata fetch can take a moment on large environments

End with the Chrome Web Store link placeholder [CHROME_STORE_LINK] and mention it also works on Edge.
```

---

## Prompt 4: PowerPoint Presentation

Attach: ALL 7 images

```
I have a free browser extension for D365 Finance & Operations called "D365 F&O Table & OData Browser Pro". I need you to create a PowerPoint presentation (.pptx) I can use to share with colleagues and the D365 community.

Here are 7 screenshots of the actual extension. Use them in the slides — don't mock up fake UI.

Please create a clean, professional PowerPoint with these slides:

Slide 1 — Title
- "D365 F&O Table & OData Browser Pro"
- Subtitle: "A free browser extension for Dynamics 365 Finance & Operations"
- Created by Tom Loraso

Slide 2 — The Problem
- Working with D365 tables means manually building Table Browser URLs
- OData queries require hand-crafting complex URLs with $select, $filter, $top, cross-company
- Switching between Dev, UAT, and Prod means changing URLs constantly
- Keep it brief — 3-4 bullet points max

Slide 3 — Table Browser
- Search 15,800+ D365 tables by name instantly (no metadata loading)
- Open the Table Browser in one click
- Favorites and history for quick access
- Include the "Table Browser.png" and "Favourites.png" screenshots

Slide 4 — OData Query Builder
- Visual query builder: pick entity, select fields, add filters
- Cross-company queries in one toggle — pull data across all legal entities
- Results in a sortable data grid
- Export to CSV, TSV (paste into Excel), or JSON
- Include the "OData query builder with multi legal entity capability.png" screenshot

Slide 5 — Multi-Environment Support
- Configure Dev, UAT, Prod with color-coded badges
- Switch environments from a dropdown
- Side panel mode — pin alongside D365 while you work
- Include "Environment Selection.png" and "Environment configuration.png" screenshots

Slide 6 — Security & Privacy
- Uses your existing D365 browser session — no credentials stored
- Read-only — cannot modify D365 data
- D365 enforces all security server-side — you only see what your role allows
- No data sent to external servers, everything stays in your browser

Slide 7 — Get It (Free)
- Chrome Web Store: [CHROME_STORE_LINK]
- Also works on Microsoft Edge (same extension)
- Feedback & suggestions welcome
- Contact: linkedin.com/in/tomloraso

Style: Clean, minimal, white background. Use an indigo-to-blue accent color (#6366F1 to #38BDF8) to match the extension branding. No animations or transitions. This is a utility tool, not a sales deck — keep it functional and understated.

Output as a downloadable .pptx file.
```

---

## Prompt 5: Privacy Policy

No images needed.

```
Write a short, plain-English privacy policy for a free browser extension called "D365 F&O Table & OData Browser Pro".

Facts:
- Does NOT collect any user data
- Does NOT send data to any external server or third party
- Stores user preferences (environment configs, favorites, history) locally in chrome.storage.local — never leaves the browser
- Makes HTTPS requests ONLY to Dynamics 365 URLs that the user explicitly configures in settings
- Uses the user's existing browser session cookies to authenticate — no passwords, tokens, or API keys are stored
- Permissions: storage, unlimitedStorage, activeTab, sidePanel
- Host permissions: *.dynamics.com (HTTPS only)

Keep it short and human-readable. No legal jargon. Include contact: https://www.linkedin.com/in/tomloraso
```
