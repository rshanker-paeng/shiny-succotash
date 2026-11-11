# BWG Global Advisory website

The public website for BWG Global Advisory, published at **https://www.bwgglobal.net**. It's a single-page site with Home, Approach, Services, Discovery and About Us views, and an interactive Discovery Assessment that produces a scored requirements brief in the visitor's browser. Each view has its own link, for example `https://www.bwgglobal.net/#approach`.

```
index.html            <- the built, self-contained page that GitHub Pages serves (do not edit by hand)
src/index.html        <- the page you edit
src/input.css         <- Tailwind entry file
build.mjs             <- build script: src/index.html -> index.html
package.json          <- pinned build tools
CNAME                 <- tells GitHub Pages the site's domain: www.bwgglobal.net
robots.txt            <- tells search engines they may index the site, and where the sitemap is
sitemap.xml           <- the page list for search engines
og-image.png          <- image shown when the site is shared on LinkedIn, Slack, iMessage, etc. (1200x630)
logo.png              <- logo for search engines (structured data)
favicon.svg / favicon.ico / apple-touch-icon.png  <- browser tab and home-screen icons
.nojekyll             <- tells GitHub Pages to serve files as-is
```

## Analytics (Umami Cloud)

The site is ready for [Umami](https://umami.is). The Hobby plan is free: 1 website, 100,000 events a month and 6 months of history. Umami uses no cookies, so no cookie banner is needed.

**Status:** switched on. Website ID `29b95225-8589-4c2e-9228-350bd596418f` is set in both `index.html` and `src/index.html`.

**To change the account later**
1. Sign up at umami.is, choose **Add website**, name it "BWG Global Advisory" and enter the domain `www.bwgglobal.net`.
2. Copy the **Website ID** (a long code like `a1b2c3d4-...`).
3. In both `index.html` and `src/index.html`, find `var UMAMI_WEBSITE_ID = '';` and paste the ID between the quotes. You can do this in GitHub's web editor: open the file, click the pencil icon, press Cmd+F to find the line, then commit.

Tracking only runs on www.bwgglobal.net, so visits from your own computer while editing are not counted.

**What you'll see in Umami**
- **Visitors, visits and page views**, with countries, regions and cities, devices, browsers and referring sites.
- **Pages:** each tab counts as its own page (`/`, `/#approach`, `/#services`, `/#discovery`, `/#about`).
- **Events:**
  - `Click: <button or link text>` for every button and link, with the tab it was on.
  - `Practice details opened`, `Maturity widget scored`, `Site search`, `Email link clicked`.
  - `Strategy session form opened`, `Strategy session request sent` / `failed`, and `Calendly opened`.
  - `Discovery step`, `Discovery completed` (areas, score, number of gaps), and `Discovery brief downloaded`, `copied`, `printed` and `email to BWG`.

No names, email addresses, company names or assessment answers are sent to Umami. Mention Umami in your privacy notice.

## Search engine optimisation

**Already in the page**
- **Title:** "BWG Global Advisory | Technology Advisory, Startup to Exit". Each tab sets its own title when opened.
- **Description:** used by Google as the snippet under the title.
- **Canonical address, robots and theme colour.**
- **Social sharing (Open Graph and X cards):** tags that use `og-image.png`.
- **Structured data (JSON-LD):** Organization, WebSite and WebPage, describing BWG Global Advisory with founding year 2012, regions served, contact emails and the four services.
- **Headings:** one main heading (H1) on the page, with each tab's title as an H2.
- **Files:** `robots.txt`, `sitemap.xml` and the icons.

**Do once after publishing**
1. **Google Search Console** (search.google.com/search-console):
   - Choose **Add property → Domain**, enter `bwgglobal.net`, and add the TXT record it gives you in GoDaddy's DNS settings. GoDaddy may offer to do this automatically.
   - Then go to **Sitemaps** and submit `https://www.bwgglobal.net/sitemap.xml`.
   - Use **URL inspection → Request indexing** for `https://www.bwgglobal.net/`.
2. **Bing Webmaster Tools** (bing.com/webmasters): choose **Import from Google Search Console**. This also covers DuckDuckGo and Yahoo.
3. **Test the sharing preview:** paste `https://www.bwgglobal.net` into LinkedIn's Post Inspector (linkedin.com/post-inspector) to check the image and text.
4. **Test the structured data:** run Google's Rich Results Test (search.google.com/test/rich-results) on the address.

**Good to know**
- **One page to Google:** all tabs live on one page. Google indexes all the text, but it treats the site as a single page. To rank individual services for their own searches (for example "PE technical due diligence"), the next step would be separate pages per service.
- **When you change content:** update the `<lastmod>` date in `sitemap.xml` when you make significant changes.

## Publish on GitHub Pages

1. Create a new **public** repository on GitHub. On a free account, GitHub Pages only works with public repositories. Upload everything in this folder, including `CNAME`. Some computers hide `.gitignore` and `.nojekyll`; the site works without them. Upload the folder's contents, so that `index.html` and `CNAME` sit at the top level of the repository. Either drag and drop the files on the repository page, or from a terminal:
   ```bash
   git init
   git add .
   git commit -m "BWG advisory website"
   git branch -M main
   git remote add origin https://github.com/<your-account>/<repo-name>.git
   git push -u origin main
   ```
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, the branch to **main** and the folder to **/ (root)**, then press **Save**.
4. Because of the `CNAME` file, the **Custom domain** box on the same screen should already read `www.bwgglobal.net`. If it's empty, type `www.bwgglobal.net` and press **Save**.

## Point bwgglobal.net at GitHub

Add these records in the DNS settings wherever `bwgglobal.net` is registered (for example GoDaddy, Namecheap or Cloudflare). Replace `<your-account>` with your GitHub username or organisation name. Leave out the repository name.

| Type | Host / Name | Value |
|---|---|---|
| CNAME | `www` | `<your-account>.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA (optional, IPv6) | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` (one record each) |

- **Remove any old records first.** Delete existing A, AAAA or CNAME records for `@` and `www` (for example a registrar's "parked" page) before adding these, or they will conflict.
- **What these records do:** the `www` record serves the site at **www.bwgglobal.net**, the main address. The `@` records make plain **bwgglobal.net** redirect there automatically.
- **Timing:** DNS changes can take from a few minutes to 24 hours to spread. **Settings → Pages** shows a green "DNS check successful" message when they're working.
- **HTTPS:** once the DNS check passes, tick **Enforce HTTPS** in **Settings → Pages**. The option can take up to 24 hours to become available.
- **Recommended:** verify the domain in your GitHub account (**Settings → Pages → Add a domain**, under your profile or organisation settings). This stops anyone else's GitHub repository from claiming `bwgglobal.net`.
- **Email:** don't change any **MX** or **TXT** records. Those carry email for `advisory@` and `info@bwgglobal.net`, and the website records above don't affect them.

No build runs on GitHub. The committed `index.html` is already complete: Tailwind CSS compiled, icons and font embedded, and no external requests.

## Making changes

1. Edit `src/index.html`. It still loads Tailwind and Lucide from CDNs, so you can open it straight in a browser while you work (with an internet connection).
2. Rebuild the page that gets published (Node.js 18 or newer):
   ```bash
   npm install      # first time only
   npm run build    # writes ./index.html
   ```
3. Commit **both** `src/index.html` and `index.html`, then push. GitHub Pages republishes automatically.

If you skip step 2, the live site won't show your edit, because Pages serves `index.html`, not `src/index.html`.

### Tailwind notes
- The build uses **Tailwind CSS v3** (pinned to 3.4.19). Don't upgrade to v4: it changed the CLI (`@tailwindcss/cli`) and the configuration format this page uses.
- Theme colours and fonts live in the `tailwind.config = {...}` block near the top of `src/index.html`. The build reads them from there, so there is no separate config file.
- Write class names in full, for example `text-sage-600`. Tailwind only generates classes it can see as complete words, including inside the page's JavaScript.

## Colour palette

| Role | Hex |
|---|---|
| Ink navy (headings, buttons, footer) | `#13233A` |
| Harbour blue (links, labels, selected states) | `#3A5577` |
| Stone (body text / borders) | `#57534E` / `#D9D2C3` |
| Ivory (background) | `#F7F5F0` |
| Brass (rules, figures, accents) | `#A4844C`, text shade `#6B522E` |
| Sage / Claret (status only) | `#4B6356` / `#8B3A3A` |

## Before going live

- **Testimonials:** four quotes were reworded to credit the BWG team instead of an individual. Confirm each client is happy with the new wording.
- **Email addresses:** the footer lists `advisory@bwgglobal.net` (advisory enquiries) and `info@bwgglobal.net` (general). The Discovery Assessment's "Email BWG" button drafts an email to `advisory@bwgglobal.net`. Send a test message to each address to confirm both mailboxes receive mail.
- **Discovery Assessment:** answers stay in the visitor's browser and nothing is sent to a server.
- **"Book a Strategy Session" form:** connected. When a visitor submits it:
  1. **Web3Forms** emails their name, email, company, focus area and message to the address on your Web3Forms account. If they came from the Discovery Assessment results, their assessment summary is included.
  2. **Calendly** then opens your booking calendar (`calendly.com/bwg-strategy-session/30min`) with their name and email pre-filled. If Calendly's pop-up can't load, a "Choose a time" button opens the booking page in a new tab.
  3. **If sending fails,** the visitor sees `advisory@bwgglobal.net` and a direct booking link instead.

  **Send one real test** from the live site, confirm the email arrives (check spam the first time), then book and cancel a test slot in Calendly.
- **Web3Forms settings:** the access key sits in the page code. That's by design: it only lets visitors send *you* an email. In your Web3Forms dashboard, set the notification email you want (for example `advisory@bwgglobal.net`). The free plan allows 250 submissions a month, and submissions stop once that limit is reached.
- **Calendly settings:** the free plan allows one event type. Confirm the event's duration, availability and video link. To change the link, edit `BWG_CALENDLY_URL` (and the `cf-book` link) in `src/index.html`, then rebuild.
- **Privacy notice:** visitor details are processed by Web3Forms and Calendly. Mention both in your privacy notice.

## Third-party components

- **Libre Baskerville** font: © The Libre Baskerville Project Authors, SIL Open Font License 1.1. Embedded from `@fontsource/libre-baskerville`.
- **Lucide** icons (search, menu, arrow-right, quote, check, x): © Lucide Contributors, ISC License.
- **Tailwind CSS**: © Tailwind Labs, MIT License. Used at build time only.
- World map outline derived from Natural Earth (public domain).
