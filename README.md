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
