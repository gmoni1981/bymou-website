# BYMOU — Mounia El / Editorial portfolio

This is the existing `gmoni1981/bymou-website` repository. The current site is static HTML, CSS and JavaScript with locally vendored GSAP. There is no build step or React migration.

## Local preview

```bash
cd "/Users/mouni/Desktop/Mymou cotex/bymou-website"
python3 -m http.server 3000 --bind 127.0.0.1
```

Open http://localhost:3000. The existing website root is this repository's `index.html`. Do not create a duplicate project. Production deployment requires the owner's explicit approval; no deployment is part of this redesign.

## Current files

- `index.html`: editorial homepage, signature installation, selected work, lab, resources and contact.
- `editorial.css` / `editorial.js`: new design system, responsive layouts, language switching, motion and interactions.
- `about.html`: Mounia's portrait and biography.
- `work/*.html`: ten static, directly linkable project pages using the existing videos.
- `data/site.json`: English/French/Italian copy, factual project metadata and the Resources collection.
- `content-editor.html`: browser-based Resources editor. Open it locally, edit or import content, download `site.json`, then replace `data/site.json` and review the result. It never writes to the server or publishes. Existing translation keys are preserved for unchanged resource fields. Custom resource text is displayed as entered.
- `assets/editorial/`: optimized derivatives, video posters, sharing image and an exact copy of the supplied `composite.png` portrait. No identity changes or AI generation.

Original `assets/images`, `assets/video`, logo assets, translations in `project.js`, and legacy styling/animation scripts remain unchanged. Legacy service, insight and case study pages remain available.

## Commercial integrations

The inquiry form validates the visitor's input and prepares an email to the existing `mou@bymou.space` address. Nothing is sent automatically or stored by the site. A copyable draft is provided if no email app opens.

No newsletter provider is configured. The design clearly says email letters are in preparation and links to the existing Instagram account; it never simulates a subscription. A real signup needs an approved provider and public subscription URL.

The existing Adobe Fonts kit is retained with system-serif fallbacks. The existing GA4 measurement ID is retained, but loads only on `bymou.space` and `www.bymou.space`, never localhost.

Resources link to technologies demonstrably used by the existing project. There are no invented affiliate relationships, client claims, production credits, testimonials or awards.

## Verification

Browser checks covered real video playback, project navigation, filters, all three languages, 320/390/768/1440px widths, image comparison, dialogs, mobile navigation, email draft preparation, resource export and unsafe-link rejection, system reduced motion, manual pause and JavaScript-disabled navigation. Static checks covered local references, locale parity, structured files, JavaScript syntax, original-media preservation, exact source-portrait hash, and whitespace errors.

## Historical export notes

The original export instructions below are retained as project history. The current editable source is the repository root described above. Keep existing hosting settings until deployment is explicitly approved.

---

# BYMOU Website Export

This website must be opened with a local server.

Do not double-click `index.html` and do not open it directly from the ZIP. Some browser features, JavaScript modules, videos, WebGL assets, and local paths need a server environment to load correctly.

## Run locally

Unzip the project first, then open Terminal and go into the project folder:

```bash
cd project-folder
python3 -m http.server 3000
```

Then open:

```text
http://localhost:3000
```

If port `3000` is already in use, use another port:

```bash
python3 -m http.server 3001
```

Then open:

```text
http://localhost:3001
```

## Cloudflare Pages deployment

Deploy this as a static HTML/CSS/JS website from GitHub. No build step is required.

Cloudflare Pages settings when connecting the GitHub repository:

```text
Framework preset: None
Build command: leave empty
Build output directory: BYMOU_WEBSITE_EXPORT
Root directory: leave empty
```

The website entry file is:

```text
BYMOU_WEBSITE_EXPORT/index.html
```

## Custom domain DNS

After creating the Cloudflare Pages project, add these custom domains in Cloudflare Pages:

```text
bymou.space
www.bymou.space
```

Use these DNS records in Cloudflare DNS, replacing `<your-pages-project>.pages.dev` with the Pages URL Cloudflare gives you:

```text
Type: CNAME
Name: @
Target: <your-pages-project>.pages.dev
Proxy status: Proxied

Type: CNAME
Name: www
Target: <your-pages-project>.pages.dev
Proxy status: Proxied
```

If Cloudflare creates the DNS records automatically when you add the custom domains, keep the generated records.

## SEO files

The export includes:

```text
robots.txt
sitemap.xml
```

Current sitemap URL:

```text
https://bymou.space/sitemap.xml
```

## Analytics

Google Analytics 4 is installed in `index.html` with Measurement ID:

```text
G-Q428VQGBG2
```
