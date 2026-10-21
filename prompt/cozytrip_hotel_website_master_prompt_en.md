# CozyTrip Japan Hotel Travel Website — Master Prompt (English)

> Purpose: Design and implement a Japanese hotel and travel-content website for `cozytrip.kr`. This specification can guide an AI coding agent to reproduce, audit, or improve the CozyTrip hotel blog project.
>
> **Important:** A specification alone does not grant API access, affiliate approval, advertising approval, or factual verification. Never fabricate hotel facts, links, prices, ratings, review counts, or availability.

---

## 1. Role and Workflow

Act as a senior Astro/TypeScript engineer, UI/UX designer, technical SEO specialist, and content-automation architect.

Follow this workflow:

1. Inspect the existing repository and project structure before editing.
2. Compare the requirements against the actual code and distinguish implemented, incomplete, and missing functionality.
3. Design the data model, routes, design tokens, and editorial review workflow.
4. Implement the complete project.
5. Run static checks, type checks, tests, and a production build.
6. Fix failures and repeat verification.
7. Document deployment steps, external-service configuration, and required environment variables.
8. Report deliverables and evidence of verification.

Never claim a command succeeded unless it actually ran successfully. If network access, API credentials, or account approval is unavailable, state the limitation and explain what was and was not verified.

## 2. Brand and Domain

- Brand name: **CozyTrip**
- Canonical domain: `https://cozytrip.kr`
- Subject: Japanese hotels, accommodation selection, regional travel, transport and sightseeing around hotels, and Japan trip-planning guides
- Primary language: Korean
- Brand voice: calm, trustworthy, practical travel editorial
- Do not use the CozyMoney name, finance-calculator messaging, or `cozymoney.kr` canonical URLs.
- Keep the brand and domain consistent across titles, descriptions, canonical tags, Open Graph metadata, sitemap, robots.txt, JSON-LD, internal links, and documentation.
- Updating the code does not automatically configure DNS, Cloudflare Pages custom domains, SSL, Search Console, analytics, or ad platforms. These require separate verification in the relevant accounts.
- Do not change DNS or deploy to production without explicit authorization.

## 3. Product Goals and Audience

### Goals

- Help Japan-bound travelers discover and compare hotels and regions efficiently.
- Provide a useful, original content structure that can be discovered through search engines.
- Connect hotel detail pages with regional hubs and practical travel guides.
- Support approved affiliate programs such as Agoda with proper disclosures and tracking rules.
- Provide clearly separated advertising slots that can be configured after Google AdSense approval.
- Automate content drafting and validation without removing factual review or human approval.

### Audience

- First-time visitors to Japan
- Travelers looking for accommodation near a city or train station
- Families, couples, and solo travelers
- People comparing transport access, room types, check-in policies, and amenities
- Travelers choosing accommodation around their itinerary and budget

## 4. Technology Stack and Constraints

- Use Astro, TypeScript, and Bun as the core stack.
- Prefer Astro static site generation (SSG).
- Use UnoCSS for styling.
- Use UnoCSS Attributify syntax as the default utility-writing style.
- Add only small client-side scripts where necessary. Avoid unnecessary frontend frameworks and heavy runtimes.
- Prioritize semantic HTML, keyboard accessibility, responsive UI, performance, and SEO.
- Avoid indiscriminate use of `any`. Validate external inputs and content records with runtime schemas.
- If a repository already exists, inspect its configuration, structure, and branch state first. Do not remove unrelated functionality or overwrite an existing production site.
- Never commit `.env` files, real API keys, tokens, or personal data.
- Do not force server-side features into a static SSG architecture. If required, document the separate runtime (for example, Cloudflare Pages Functions) and its limitations.

### Recommended package scripts

Provide these scripts in `package.json` where applicable:

- `bun run dev`
- `bun run check`
- `bun test`
- `bun run build`
- `bun run preview`
- `bun run format`
- `bun run content:validate`
- `bun run content:draft`

Implement them to match the real project. Never report an unexecuted command as successful.

## 5. UnoCSS Attributify Rules

Use Attributify syntax by default in all authored and modified UI code.

### Mandatory rules

- Do not pack ordinary utility classes into attributes such as `<div class="...">`, `<a class="...">`, or `<section class="...">`.
- Prefer Attributify attributes such as `m`, `p`, `flex`, `grid`, `items`, `justify`, `gap`, `rounded`, `shadow`, `bg`, `text`, `font`, `leading`, `border`, `hover`, `focus`, and `dark`.
- Group related utilities into the same attribute when practical, such as `text="sm muted"` or project-defined color aliases.
- Do not merely rename the `class` attribute. Verify that the resulting syntax is valid for the configured UnoCSS presets and Attributify transformer.
- Inspect Astro templates, repeated rendering, conditional attributes, TypeScript template strings, and dynamic utility generation.
- A third-party component may require a `class` attribute; allow such exceptions only when necessary and document the reason.
- Do not add arbitrary CSS files or ordinary CSS as a workaround. Avoid creating CSS files that are not required by the specification.
- Confirm that `presetAttributify`, any required transformer, and the Astro/UnoCSS integration are configured correctly.
- Run `bun run check` and a production build to catch invalid attributes and missing utilities.

## 6. Design System and Color

### Visual direction

Use Color Hunt (`https://colorhunt.co/`) as inspiration for exploring harmonious palettes, but do not claim to have copied a particular palette unless that is verified. Define an original, cohesive palette suitable for a Japanese travel and hotel editorial website.

Suggested direction:

- Warm ivory or cream backgrounds
- Terracotta or muted reddish-brown primary actions
- Sage-green secondary accents
- Deep charcoal body text
- Low-contrast neutral tones for cards and dividers

Use color to establish atmosphere, readability, contrast, and semantic distinction. Reuse the same design tokens across the site.

### Mandatory OKLCH requirement

- Define project color tokens with `oklch()`.
- Do not introduce HEX, RGB, or HSL values as new design-token definitions.
- Audit color variables, hover/active/focus states, borders, shadows, backgrounds, text, and dark-mode tokens.
- Use supported OKLCH alpha syntax or token variants for transparency.
- Pixel colors inside third-party logos or photographs are distinct from CSS color tokens. Any color declaration authored directly in CSS must still use OKLCH.
- If gradients are used, every color stop must use OKLCH.
- Do not hide non-OKLCH color literals inside shadow declarations.
- Semantic keywords such as `currentColor` and `transparent` are allowed where appropriate, but must not be used as a workaround for fixed colors.

### Dark mode

- Follow the operating system color scheme.
- Use UnoCSS `dark: 'media'`.
- Do not add an unnecessary manual theme toggle.
- Ensure body text, cards, links, inputs, navigation, ad areas, borders, and focus indicators remain legible in both themes.
- Verify the result under `prefers-color-scheme`.

### UI/UX requirements

- Mobile-first responsive layout
- Navigation and card density optimized for mobile, tablet, and desktop
- Clear visual hierarchy and adequate whitespace
- Readable typography and line height
- Hover, active, and `focus-visible` states for links, buttons, and interactive cards
- Full keyboard access to all core functionality
- Adequate target sizes for touch interaction
- Loading, empty, error, and no-search-results states
- No excessive animation or page-transition effects
- If motion is needed, keep it subtle and respect `prefers-reduced-motion`
- Prevent ads from obscuring content or causing excessive layout shifts; reserve appropriate slot space

## 7. Information Architecture and Pages

Provide at least the following routes and capabilities. If the existing project uses a different route structure, adapt paths without dropping required functionality.

1. Home `/`
2. Hotel listing `/hotels/`
3. Hotel detail `/hotels/[slug]/`
4. Region listing `/regions/`
5. Region detail `/regions/[slug]/`
6. Travel guide listing `/guides/`
7. Travel guide detail `/guides/[slug]/`
8. Search `/search/`
9. Category/topic exploration `/categories/`
10. About `/about/`
11. Contact `/contact/`
12. Editorial and fact-check policy `/editorial-policy/`
13. Affiliate disclosure `/affiliate-disclosure/`
14. Privacy policy `/privacy/`
15. Terms `/terms/`
16. 404 page
17. Content-drafting tool at `/studio/` or a separate editorial tool

### Home page

- Hero area that clearly explains CozyTrip's purpose
- Primary links for discovering hotels and regions
- Hotel content reviewed by an editor
- Regional or topic hubs
- Trip-planning guides
- Useful internal links and clear next actions
- If ads are enabled, visually distinguish them from editorial content

### Hotel listing and detail pages

Hotel listing:

- Show verified fields such as hotel name, region, concise description, and representative image
- Allow exploration by region, feature, or query
- Show a helpful empty state when no records or filter results are available

Hotel detail:

- Verified name, address, official website, and other available facts
- Region, nearby station, and transport notes when verified
- Room, amenity, and check-in/check-out policy information only when supported by sources
- Explain which traveler profiles may find the property suitable without unsupported certainty
- Present advantages and considerations in a balanced way
- Official hotel page and approved affiliate links
- Last-verified date
- Related region pages and guides
- Affiliate disclosure
- Structured data only for facts actually displayed on the page

Do not display prices, room inventory, ratings, review counts, booking availability, or travel times unless verified through a current reliable source or authorized data feed.

### Region pages

- Overview and typical travel purposes
- Transport hubs and major stations when verified
- Hotels in the region
- Guides for different travel needs
- Ways to reach nearby regions
- Internal links between related content
- Never invent opening hours, fees, or distances that have not been checked.

### Travel guides

- Original explanations centered on real user needs
- Purpose, preparation checklist, step-by-step guidance, cautions, and official references
- Update date and items requiring verification
- Relevant links to hotel and region pages
- Do not produce low-quality pages that merely repeat search keywords.

## 8. Content Data Model and Editorial Review

Separate hotel, region, and guide data from page templates to avoid duplication.

### Example hotel record fields

- `slug`
- `name`
- `nameJa` (only if the Japanese name is verified)
- `regionSlug`
- `summary`
- `description`
- `address`
- `officialUrl`
- `affiliateUrl` (only when a valid approved tracking URL exists)
- `image` or image object
- `amenities`
- `transportNotes`
- `checkIn`
- `checkOut`
- `lastVerifiedAt`
- `sources`
- `status`: `draft`, `review`, `published`, `archived`
- `editorialNotes`

Use optional fields only when actual data is available. Do not assume every record contains every field.

### Editorial rules

- Drafts are unpublished by default.
- Do not include unverified drafts in public pages or the sitemap.
- Prefer official hotel websites, official transport operators, and tourism boards.
- Preserve source URLs and verification dates in internal data.
- Mark unsupported or conflicting values as `needs verification`; do not fill them with guesses.
- AI-generated content must not be published automatically before human review and approval.
- Do not mass-generate duplicate, thin, or template pages that differ only by city name.
- Verify image licensing, source, and alt text. A reachable remote image URL does not prove permission to use it.
- Do not copy text, photographs, logos, or reviews from third-party websites without authorization.

## 9. Content Drafting Tool

The `/studio/` page or CLI drafting tool must create and validate drafts, not silently publish them.

Requirements:

- Validate all inputs
- Validate URL formats and required fields
- Generate title, summary, body, sources, and editorial notes
- Export or download Markdown
- Create records with `draft` status
- Keep public publishing and sitemap inclusion behind a separate approval step
- Draft generation must not trigger external API calls, bookings, or purchases by itself
- Never expose user data or API keys in the browser
- If the browser tool does not save data to a server, document that limitation accurately
- CLI tools must validate schemas, handle paths safely, and prevent unintended overwrites

### Future Agoda API integration

- Implement only after reviewing the actual API documentation and account permissions.
- Do not guess endpoints, fields, authentication, rate limits, or response schemas.
- Keep API keys in server-side environment variables or a secret store.
- Never expose secrets in browser bundles, public environment variables, or source control.
- Follow affiliate API terms and image/content licensing rules.
- Never invent information that the API does not provide.
- Handle errors, timeouts, rate limits, and empty responses; do not log secrets.
- If API access has not been verified, provide an adapter interface and setup documentation rather than claiming integration is complete.

## 10. Agoda Affiliate and Monetization

- Verify affiliate enrollment and approval in the actual account.
- Use only affiliate URLs actually issued by the program.
- Never present a demo URL as a real booking link.
- Place a clear, understandable affiliate disclosure near relevant links.
- Verify that links work and follow tracking and redirect rules.
- Do not display price or availability without verified data.
- Maintain an editorial policy that prevents affiliate revenue from overriding accuracy.
- User trust and factual accuracy take priority over monetization.

## 11. Google AdSense

- Do not imply ads are active before approval and configuration.
- Configure the publisher/client ID and slot IDs through environment variables.
- The site must remain functional when ad variables are absent.
- Clearly identify ad placements and keep them visually distinct from editorial content.
- Never encourage ad clicks or disguise ads as ordinary navigation.
- Confirm privacy and consent requirements based on visitor regions and actual ad settings.
- Provide a checklist for steps that require the user's account or approval.

## 12. SEO and Structured Data

- Unique title and meta description per page
- Consistent canonical URLs based on `https://cozytrip.kr`
- Open Graph and social-sharing metadata
- XML sitemap and robots.txt
- Checks for broken internal links and duplicate slugs
- Useful internal linking
- Image alt text and appropriate image sizes
- Correct heading hierarchy
- JSON-LD only for data visible on the actual page
- Use suitable types such as `WebSite`, `Organization`, and `BreadcrumbList`; never invent reviews, ratings, or prices in structured data
- Explicitly control indexing for draft or tool pages that require `noindex`
- Exclude drafts, 404 pages, and `noindex` pages from the sitemap
- Verify the domain in canonical URLs and the generated sitemap during build

## 13. Accessibility, Performance, and Security

### Accessibility

- Use semantic HTML landmarks
- Provide explicit form labels
- Make keyboard focus clearly visible
- Provide appropriate image alt text
- Do not communicate state through color alone
- Maintain sufficient contrast
- Give menus and search inputs accessible names
- Respect `prefers-reduced-motion`

### Performance

- Minimize unnecessary client-side JavaScript
- Optimize images and lazy-load non-critical imagery
- Minimize font requests
- Reduce layout shifts (CLS)
- Prefer static pages
- Avoid sending unnecessarily large data sets to the client

### Security

- Do not place secrets or personal data in source code, logs, or public builds.
- Validate external input and handle output safely for its context.
- Check the draft tool for arbitrary file writes, accidental overwrites, and HTML injection.
- Use appropriate `rel` attributes for external links.
- Do not claim to collect personal data unless the actual feature does so. Keep the privacy notice consistent with real behavior.

## 14. Tests and Verification

Automate the following where practical:

1. TypeScript/Astro checks
2. Content schema validation
3. Duplicate hotel slug checks
4. Validation that referenced region slugs exist
5. Consistency between publication status and sitemap inclusion
6. Internal-link target checks
7. Attributify syntax and UnoCSS configuration checks
8. Validation that design color tokens use OKLCH
9. Search for stale `cozymoney.kr` URLs or old brand names
10. Canonical and sitemap domain validation
11. Unit tests
12. Astro production build
13. Manual responsive and dark-mode review
14. Keyboard accessibility and empty-state review
15. Ensure `.env` and API keys are not committed

If a test fails, fix the root cause and rerun it. Mark tests that could not run as **not run**. Report “build successful” only when an actual build succeeds.

## 15. Documentation and Deployment

Include the following documentation:

- `README.md`: setup, development, tests, build, and project structure
- `.env.example`: required variable names and explanations, without real secrets
- Content automation guide
- Editorial review and publishing guide
- Agoda integration prerequisites
- AdSense configuration guide
- Cloudflare Pages deployment guide
- SEO and domain migration checklist
- Test results and known limitations

Pre-deployment checklist:

- `cozytrip.kr` and HTTPS
- Cloudflare Pages project settings
- Actual Bun version and lockfile
- Production and Preview environment variables
- Sitemap and robots.txt
- Search Console registration
- Analytics and advertising settings
- Privacy and affiliate disclosures
- Review status of all drafts
- Link validity and image permissions
- Actual production build result

Do not perform DNS changes, production deployments, paid API calls, bookings, or payments without explicit authorization.

## 16. Deliverables

Include in the final response and project files:

- Complete project source
- Working `package.json` scripts
- Installation and run instructions
- `.env.example`
- Automation and operations documentation
- Test and build results
- Items requiring manual configuration
- Missing features and reasons
- Download link to a ZIP containing the complete source

Do not claim the project is complete if only partial snippets are provided. Clearly distinguish sample data from verified production data.

## 17. Definition of Done

Report completion only when all applicable items below are satisfied:

- [ ] Brand is CozyTrip and canonical domain is `https://cozytrip.kr`.
- [ ] All core pages exist and navigation works.
- [ ] Ordinary utility `class` usage has been avoided and UnoCSS Attributify is applied consistently.
- [ ] All authored design color tokens use OKLCH.
- [ ] OS-based dark mode works.
- [ ] Layout works on mobile, tablet, and desktop.
- [ ] Content schema and draft/review/publish workflow are implemented.
- [ ] Unverified hotel facts, prices, reviews, and booking links are not presented as true.
- [ ] Advertising and affiliate behavior accurately reflects actual configuration.
- [ ] SEO, privacy, and affiliate disclosure pages are included.
- [ ] Checks, tests, and build results are reported from actual execution.
- [ ] README and operations documentation are included.
- [ ] The ZIP contains the complete source.

**Begin by inspecting the existing project, compare its actual implementation against these requirements, implement missing items, and verify the result.**
