# Marketing Prompts for Claude

Use these prompts in Claude (claude.ai) to generate marketing assets. Attach screenshots of your extension for best results.

---

## Prompt 1: Chrome Web Store Promotional Images

```
I need promotional images for my Chrome Web Store extension listing.

Extension name: D365 F&O Table & OData Browser Pro
What it does: A browser extension for Dynamics 365 Finance & Operations consultants that lets them:
- Search 15,800+ D365 tables instantly
- Build OData queries visually with a drag-and-drop query builder
- Run cross-company queries in one click
- Export results to CSV/Excel/JSON
- Manage multiple D365 environments with color-coded switching
- Works from a side panel pinned alongside D365

Target audience: D365 F&O functional consultants, developers, and solution architects

Brand colors:
- Primary: Dark navy (#1B2A4A)
- Accent: Sky blue (#38BDF8) to purple (#818CF8) gradient
- Clean, modern, professional look

Please create:
1. A Chrome Web Store promotional tile (1400x560) — hero banner with extension name, 3 key features as bullet points, and a mockup of the extension UI
2. A small promotional tile (440x280) — simpler version with just the name and a tagline like "Query D365 data in seconds"

Style: Clean, minimal, tech-professional. No gradients overload. Think Notion/Linear/Vercel style marketing.
```

---

## Prompt 2: LinkedIn Post Image / Carousel

```
I'm sharing a browser extension I built on LinkedIn and need eye-catching visuals.

Extension: D365 F&O Table & OData Browser Pro
Audience: Dynamics 365 consultants and developers on LinkedIn

Create a LinkedIn carousel (1080x1080 per slide) with these slides:

Slide 1 (Hook): "Stop manually building OData URLs" — large text on dark navy background with a subtle table grid pattern

Slide 2 (Problem): "The D365 Table Browser problem" — bullet points:
- SysTableBrowser disabled on production
- Stuck in one company at a time
- No way to export data
- Building OData URLs by hand

Slide 3 (Solution): "D365 F&O Table & OData Browser Pro" — show the extension name with the key value prop: "Search 15,800+ tables. Query OData visually. Export to Excel."

Slide 4 (Feature - Search): "Instant table search" — show concept of search bar with instant results appearing

Slide 5 (Feature - Cross-company): "Cross-company queries in one click" — show concept of toggling cross-company and seeing data from all legal entities

Slide 6 (Feature - Export): "Export to CSV, Excel, or JSON" — show concept of data grid with export buttons

Slide 7 (CTA): "Free on the Chrome Web Store" — with a call to action to install

Brand colors: Dark navy (#1B2A4A), sky blue (#38BDF8), white text. Clean, modern style.
```

---

## Prompt 3: Short Video Script

```
Write a 60-second screen recording script for a demo video of my D365 browser extension. I'll record my screen while narrating this.

Extension: D365 F&O Table & OData Browser Pro
Target: D365 F&O consultants who want to look up tables and query data faster

The flow should be:
1. (5s) Open the extension popup, show the table search with instant results
2. (10s) Search for "CustTable", show it appearing, click to open Table Browser
3. (5s) Switch to the side panel view
4. (15s) Open the Query Builder, pick an entity (e.g., CustomersV3), select a few fields, toggle cross-company ON
5. (10s) Execute the query, show results loading in the data grid
6. (10s) Sort a column, then click "Copy as TSV", paste into Excel to show it works
7. (5s) Closing — show environment switcher, mention it's free

Keep the narration casual and practical — this is a tool demo, not a sales pitch. The audience are technical consultants who will appreciate seeing it work, not being sold to.
```

---

## Prompt 4: D365 Community Forum Post

```
Write a short announcement post for the Dynamics 365 Community forums (community.dynamics.com) about my new free browser extension.

Extension: D365 F&O Table & OData Browser Pro
Key features:
- Search 15,800+ D365 F&O tables instantly (no metadata loading)
- Visual OData Query Builder with cross-company support
- Sortable data grid with CSV/TSV/JSON export
- Multi-environment management with color coding
- Side panel mode
- Uses existing D365 session — no credentials stored
- Free, works on Chrome and Edge

Tone: Helpful community member sharing a tool, not promotional. Ask for feedback. Mention it's a passion project. Keep it concise — forum members skim long posts.

Include a section for "Known limitations" to show transparency:
- Table list is static (v10.0.46) — custom/ISV tables won't appear in search but you can type any name manually
- OData queries are read-only
- Requires an active D365 session in the browser
```

---

## Prompt 5: Privacy Policy Page

```
Write a simple, clear privacy policy for a browser extension called "D365 F&O Table & OData Browser Pro".

Key facts about the extension:
- It does NOT collect any user data
- It does NOT send data to any external server
- It stores user preferences (environment configs, favorites, history) in chrome.storage.local — this data never leaves the browser
- It makes HTTPS requests ONLY to Dynamics 365 URLs that the user explicitly configures
- It uses the user's existing browser session cookies to authenticate with D365 — no passwords or tokens are stored
- Permissions used: storage, activeTab, sidePanel
- Host permissions: *.dynamics.com (HTTPS only)

The privacy policy should be short, human-readable, and suitable for linking from Chrome Web Store. No legal jargon. Include contact info: LinkedIn profile https://www.linkedin.com/in/tomloraso
```
