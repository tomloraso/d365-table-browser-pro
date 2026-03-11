# Publishing Plan — D365 F&O Table & OData Browser Pro

## Do I Need a Website?

**No.** None of the three stores (Chrome, Edge, Firefox) require a website. You can use your GitHub repo URL or LinkedIn profile as the "homepage" field.

- Chrome Web Store: Homepage URL is optional
- Edge Add-ons: Homepage URL is optional
- Firefox AMO: Homepage URL is optional

If you ever want a simple landing page later, a one-page GitHub Pages site would be free and take 30 minutes.

---

## Step-by-Step Publishing

### 1. Chrome Web Store (primary)

**Cost:** One-time $5 USD developer registration fee
**Timeline:** 1-3 business days for review

1. Register at https://chrome.google.com/webstore/devconsole
2. Pay the $5 fee with any card
3. Build the extension: `npm run build`
4. ZIP the `.output/chrome-mv3` folder
5. Click "New Item" > upload the ZIP
6. Fill in the listing:
   - **Name:** D365 F&O Table & OData Browser Pro
   - **Short description:** (see STORE_LISTING.md — 132 char max)
   - **Detailed description:** (see STORE_LISTING.md)
   - **Category:** Developer Tools
   - **Language:** English
   - **Homepage URL:** https://www.linkedin.com/in/tomloraso
7. Upload screenshots (1280x800 recommended — see screenshot list below)
8. Upload a promotional tile (440x280) — optional but helps visibility
9. Set pricing to **Free**
10. Submit for review

**Important:** Google may ask for a privacy policy URL for extensions that use `host_permissions`. You can host a simple one on GitHub Gist or your LinkedIn. The extension only uses D365 session cookies for read-only queries and stores settings locally — no data is collected or transmitted to third parties.

### 2. Microsoft Edge Add-ons

**Cost:** Free
**Timeline:** 1-2 business days for review

1. Go to https://partner.microsoft.com/en-us/dashboard/microsoftedge
2. Sign in with your Microsoft account
3. Click "New extension" > upload the **same Chrome ZIP** (Edge accepts MV3)
4. Fill in the same listing details
5. Submit for review

### 3. Firefox Add-ons (optional, lower priority)

**Cost:** Free
**Timeline:** Variable (can be same-day for simple extensions)

1. Build: `npx wxt build -b firefox`
2. ZIP the `.output/firefox-mv2` folder
3. Go to https://addons.mozilla.org/en-US/developers/
4. Click "Submit a New Add-on" > upload the ZIP
5. Fill in listing details
6. Submit for review

---

## Screenshots to Capture

Take these with real D365 data (blur anything sensitive):

| # | Screenshot | What to show |
|---|-----------|-------------|
| 1 | Popup — table search | Type a table name, show the search dropdown with results highlighted |
| 2 | Side panel — Query Builder | Entity selected, fields picked, filters set, cross-company toggled on |
| 3 | Side panel — Data Grid | Query results in the sortable table with export buttons visible |
| 4 | Popup — Environment selector | Multiple environments with different colors (Dev=green, UAT=orange, Prod=red) |
| 5 | Side panel — Entity Browser | Entity list with field details expanded |

**Dimensions:** 1280x800 for Chrome/Edge. Capture the browser window with the extension visible.

**Tip:** Use Chrome DevTools device toolbar to get exact dimensions, or use a screenshot extension.

---

## Privacy Policy

Chrome Web Store may require a privacy policy link. Here's a simple one you can host as a GitHub Gist:

---

**Privacy Policy — D365 F&O Table & OData Browser Pro**

This extension does not collect, store, or transmit any personal data to external servers.

- **Authentication:** Uses your existing Dynamics 365 browser session cookies. No passwords, tokens, or credentials are stored by the extension.
- **Data storage:** Environment configurations and user preferences are stored locally in your browser using `chrome.storage.local`. This data never leaves your device.
- **Network requests:** The extension only communicates with Dynamics 365 environments you explicitly configure. All requests use HTTPS. No analytics, telemetry, or tracking.
- **Permissions:** `storage` (save settings), `activeTab` (detect current D365 environment), `sidePanel` (side panel UI). Host permissions are scoped to `*.dynamics.com` domains only.

Contact: https://www.linkedin.com/in/tomloraso

---

## Recommended Publishing Order

1. **Chrome Web Store first** — largest user base, most D365 consultants use Chrome or Edge
2. **Edge Add-ons second** — same ZIP, many enterprise D365 users are on Edge
3. **Firefox AMO third** — smaller audience but easy since WXT auto-converts to MV2

## After Publishing

- Share on LinkedIn (see LINKEDIN_POST.md)
- Post in D365 community forums (Dynamics 365 Community, Reddit r/Dynamics365)
- Share the Chrome Web Store link (not GitHub — repo is private)
