# CozyTrip Hotel & Travel Content Platform — Master Prompt

> **Project:** `https://cozytrip.kr`  
> **Primary objective:** Build a trustworthy Japanese hotel and travel-information platform that can monetize through Agoda affiliate links and Google AdSense, with scalable hotel data management, content drafting, fact-checking, SEO, and publishing workflows.

## 0. Highest-priority execution principles

Act as a senior Astro/TypeScript engineer, information-architecture designer, technical SEO specialist, content-automation engineer, and editorial-workflow architect.

- If a repository exists, **inspect the repository, current branch, working tree, major configuration, test commands, and directory structure before editing**.
- Do not overwrite the project without understanding its existing functionality and design. Avoid unrelated changes.
- Prefer a purpose-specific feature branch over direct edits to `main` when practical. If work is already underway on a branch, inspect its state and do not switch branches arbitrarily.
- Follow this sequence: plan → data model/architecture → implementation → checks/tests → build → evidence-based report.
- Never claim a test, build, or API request succeeded unless it actually ran successfully. Distinguish skipped, failed, and blocked checks.
- Do not assume Agoda API access, affiliate approval, image-use rights, or AdSense approval.
- **Do not equate bulk AI drafting with automatic publication.** Automate drafting, but require fact-checking and editorial approval before publishing.
- Ask questions only when an important decision cannot be resolved from the repository or available documentation. Otherwise choose conservative, reversible defaults.
- Do not make production deployments, DNS changes, paid API calls, or account changes with external impact without explicit authorization.

## 1. Business goals and content scope

### 1.1 Monetization models

1. **Agoda affiliate:** Connect hotel detail pages and relevant travel content to booking discovery using approved affiliate-program access and actual tracking links.
2. **Google AdSense:** Display ads only after approval and configuration. Ads must not be confused with editorial content or ordinary navigation.
3. Monetization must never compromise factual accuracy, user trust, performance, or accessibility.

Code cannot guarantee program acceptance, API access, or advertising approval. Verify actual account status and current service policies separately.

### 1.2 Content categories

- Hotel profiles and accommodation-selection guides
- City- and region-level hotel hubs
- Guides to stations, airports, and local transportation
- Tourist attractions and nearby itineraries
- Local food, culture, and seasonal information
- Practical Japan travel tips: preparation, transit passes, payments, connectivity, packing, and more
- Guides for families, couples, and solo travelers
- Itinerary planning, budgeting, and accommodation-location criteria
- Policy and operational information supported by official sources

Travel information changes over time. Preserve sources and verification dates. Prefer official sources for high-impact details such as entry rules, transport, opening hours, and fees.

## 2. Required technology stack and absolute constraints

- **Astro**
- **Bun** as the package manager and script runner
- **TypeScript only** as the default for project code. Do not create new plain JavaScript files. If a tool or framework requires an exception, document why.
- **UnoCSS with Attributify only**
- Astro static site generation (SSG) by default
- Minimal client-side JavaScript only where necessary
- If server-side secrets or API proxying are required, design an appropriate server runtime, such as Cloudflare Pages Functions. Never embed secrets in static pages.

### 2.1 Absolutely no ordinary CSS

**Writing ordinary CSS directly is strictly prohibited.** Do not bypass the rule using any of these approaches:

- Do not create or author ordinary `.css` files or CSS rules.
- Do not use Astro `<style>` blocks.
- Do not use inline `style="..."` attributes.
- Do not bypass the restriction with CSS-in-JS, another CSS framework, or arbitrary stylesheets.
- Do not add ordinary CSS to achieve a design.

Implement all layout, color, spacing, typography, responsive behavior, and interactive states through UnoCSS Attributify attributes, UnoCSS theme/shortcut/token configuration, or valid utility combinations. If a required style cannot be expressed with Attributify, do not add CSS; inspect the UnoCSS configuration and alternatives first, then document any limitation.

Third-party assets or libraries may have their own styling requirements, but that exception is not permission to author ordinary CSS in this project.

### 2.2 Attributify rules

- Do not pack utility classes into `class="..."`.
- Use valid Attributify syntax such as `m`, `p`, `flex`, `grid`, `items`, `justify`, `gap`, `rounded`, `shadow`, `bg`, `text`, `font`, `leading`, `border`, `hover`, `active`, `focus`, and `dark`.
- Group related utilities into the same attribute when reasonable, for example `text="sm muted"` or project-defined color aliases.
- Do not merely rename `class`; verify that `presetAttributify`, required transformers, and Astro integration actually work.
- Verify dynamic utilities, conditional attributes, and repeated rendering in the build output.
- Allow a `class` attribute only when a third-party component requires it; keep such exceptions minimal and document them.
- Centralize design rules using UnoCSS `shortcuts`, `theme`, and color tokens.

### 2.3 Code quality

- Keep TypeScript strict and avoid unnecessary `any`.
- Validate API responses, content files, and form input with runtime schemas.
- Separate data processing from UI components.
- Create reusable components for layouts, SEO metadata, cards, ad slots, and affiliate-link UI.
- Avoid both excessive fragmentation and giant files that contain all logic.
- Avoid unused dependencies, duplicated data, and unnecessary client bundles.

## 3. Design system and responsive UX

### 3.1 Visual direction

CozyTrip should feel like a warm, calm travel editorial magazine.

- Warm ivory or cream backgrounds
- Restrained terracotta primary actions
- Sage-green secondary accents
- Readable dark neutral body text
- Subtle neutral card surfaces and dividers
- Hotel photography should support the content without harming text legibility.
- Use Color Hunt as palette inspiration, then define a cohesive palette for this brand.

### 3.2 OKLCH and dark mode

- Define all authored fixed design-color tokens using `oklch()`.
- Do not introduce HEX, RGB, or HSL as new design-token definitions.
- Check backgrounds, text, borders, focus, hover/active states, shadows, gradients, and dark-mode tokens.
- Follow the operating system theme using UnoCSS `dark: 'media'`.
- Do not add a manual theme toggle unless explicitly required.
- Pixel colors in photographs and third-party logos are distinct from authored CSS color tokens.

### 3.3 UI/UX requirements

- Mobile-first responsive layout for mobile, tablet, and desktop
- Keyboard navigation and visible `focus-visible` states
- Clear labels for buttons, links, and inputs; adequate touch targets
- Loading, empty, error, and no-results states
- Semantic HTML and accessible names
- No excessive animation or page-transition effects
- Reserve ad-slot space to reduce CLS and prevent ads from covering content
- Consistent image ratios and card heights
- Consider Pretendard or system fonts while minimizing unnecessary font requests

## 4. Information architecture and core pages

Adapt routes to the existing project when necessary, without dropping required functionality.

- `/` home
- `/hotels/` hotel listing
- `/hotels/[slug]/` hotel detail
- `/regions/` region listing
- `/regions/[slug]/` regional hub
- `/guides/` travel-guide listing
- `/guides/[slug]/` travel-guide detail
- `/attractions/` attraction listing, where useful
- `/attractions/[slug]/` attraction detail, where useful
- `/categories/` topic exploration
- `/search/` search
- `/about/` about
- `/contact/` contact
- `/editorial-policy/` editorial and fact-check policy
- `/affiliate-disclosure/` affiliate disclosure
- `/privacy/` privacy policy
- `/terms/` terms
- 404 page
- Content drafting and review tool at `/studio/` or as a CLI

### Home page

- Explain CozyTrip's audience and value clearly.
- Provide discovery paths to hotels, regions, attractions, and travel guides.
- Feature content that has actually been reviewed.
- Include topic hubs and recent updates.
- If ads are enabled, visually distinguish them from editorial content.

### Hotel listing and detail pages

Hotel listings should display verified hotel names, regions, summaries, and representative images that the site is allowed to use. Users should be able to explore by region, feature, or keyword.

When supported by verified data, a hotel detail page may include:

- Hotel name, verified Japanese name, address, and official website
- Region, nearby station, and transport information
- Room types, amenities, and check-in/check-out policies
- Evidence-based explanations of relevant traveler needs and factors to check
- Balanced editorial discussion of benefits and considerations
- Actual approved Agoda affiliate links
- Last-verified date and source references
- Contextual internal links to regions, attractions, and guides
- Clear affiliate disclosure

Do not display prices, inventory, booking availability, ratings, review counts, or travel times unless verified through an authorized API or reliable current source. Never present non-live data as live.

### Region, attraction, and travel-guide pages

- Regional characteristics, trip purposes, transport hubs, and related hotels
- Attraction's official name, address, official website, and verified opening hours/fees
- Useful preparation details and practical route considerations
- Do not state travel times or opening hours as certain unless verified.
- Write travel tips to solve real problems and include official sources, verification dates, and cautions.
- Link contextually among relevant hotels, regions, attractions, and guides.

## 5. Scalable content-data architecture

The site must support tens, hundreds, or thousands of hotels by adding data rather than copying page templates.

### 5.1 Separate data and presentation layers

- Keep hotel, region, attraction, and guide records separate from page code.
- Separate content models, schemas, data access, page templates, API adapters, and publishing validators.
- Normalize repeated data and reference shared regions/categories by ID or slug.
- Prefer file-based content suitable for static sites, choosing among JSON/TypeScript data, Markdown/MDX, or Astro Content Collections based on the existing project and update needs.
- Do not impose a storage format before inspecting the current repository and scale.
- Adding a record should require minimal page-code changes.

### 5.2 Suggested domain models

#### Hotel

- `id`, `slug`, `name`, `nameJa?`, `regionSlug`
- `summary`, `description`, `address?`, `officialUrl?`
- `amenities?`, `roomTypes?`, `checkIn?`, `checkOut?`
- `transportNotes?`, `suitableFor?`, `considerations?`
- `images[]` including source, license status, and alt text
- `agodaPropertyId?`, `affiliateUrl?`
- `sources[]`, `lastVerifiedAt?`
- `status`: `draft | review | published | archived`
- `editorialNotes?`, `createdAt`, `updatedAt`

#### Region

- `id`, `slug`, `name`, `nameJa?`, `summary`, `description`
- `transportHubs?`, `officialSources[]`, `relatedRegionSlugs[]`
- `status`, `lastVerifiedAt?`

#### Attraction

- `id`, `slug`, `name`, `regionSlug`, `summary`, `description`
- `address?`, `officialUrl?`, `openingHours?`, `admission?`
- `transportNotes?`, `images[]`, `sources[]`, `lastVerifiedAt?`
- `status`

#### Guide

- `id`, `slug`, `title`, `description`, `category`, `tags[]`
- `body`, `sources[]`, `lastVerifiedAt?`, `reviewedAt?`
- `status`, `relatedHotelSlugs[]`, `relatedRegionSlugs[]`, `relatedAttractionSlugs[]`

Store only values that are actually available. Do not fill uncertain fields with empty strings or fabricated defaults. Keep static types and runtime schemas aligned.

### 5.3 Source and fact traceability

Where practical, record the following for each external fact:

- `sourceName`
- `sourceUrl`
- `checkedAt`
- `sourceType`: official hotel, tourism board, transport operator, Agoda API, etc.
- Fields checked or editorial notes
- Confidence or review status

Do not arbitrarily choose between missing or conflicting values. Mark them as `needs-verification`.

### 5.4 Editorial state and publication rules

Implement the workflow `draft → review → approved → published → archived`.

- New content defaults to `draft`.
- Content that is not `approved` must not appear on public pages or in the sitemap.
- Before publishing, validate required fields, sources, image rights, internal links, metadata, and duplication.
- Keep `updatedAt` distinct from the last fact-verification date. Do not manipulate dates to imply freshness.
- Flag aging operational information for review.
- Never automatically publish unreviewed AI-generated content.

## 6. Agoda API and affiliate integration

### 6.1 Documentation-first rule

Agoda API access, available fields, and usage conditions may depend on account permissions and the affiliate program. Until the actual official documentation and account permissions are available, do not guess endpoints, authentication headers, request parameters, response fields, or rate limits.

### 6.2 Implementation requirements

- Isolate API communication in an `AgodaClient` or provider adapter, separate from UI code.
- Define types and runtime schemas from the actual documentation.
- Store API keys/tokens only in server-side environment variables or a secret store.
- Never place secrets in `PUBLIC_` variables, browser bundles, public JSON, logs, or source control.
- Handle timeouts, network errors, 4xx/5xx responses, empty results, and rate limits.
- Retry only appropriate failures, considering exponential backoff and provider limits.
- Do not persist raw API responses indiscriminately. Verify terms for caching, storage, and refresh intervals.
- A returned image URL does not automatically grant permission to download, rehost, modify, or permanently store the image.
- Generate and track affiliate links according to the official program documentation.
- If API access cannot be verified, do not claim integration is complete. Provide an adapter interface, mock fixtures, environment-variable examples, setup documentation, and tests instead.
- Label test data as `sample` or `mock` so it cannot be mistaken for verified live data.

### 6.3 Importing and refreshing hotel data

- Import only fields actually exposed by the authorized API, such as identifiers, names, addresses, locations, amenities, images, or affiliate URLs where available.
- Preserve source and last-verification information per field or record.
- Prefer an official property ID for deduplication; otherwise flag possible duplicates using verifiable keys.
- Do not overwrite editorially written descriptions blindly with API responses.
- Handle deleted, inactive, or missing fields safely and track changes.
- Respect API costs, rate limits, and allowed cache durations.

## 7. AI-assisted blog-drafting automation

Build a repeatable pipeline:

information gathering → source recording → draft generation → automated validation → human review → approved publication

### 7.1 Content-generation pipeline

1. Select a hotel, region, attraction, or travel topic.
2. Collect information from permitted sources, such as authorized APIs and official websites.
3. Store source URLs, verification dates, and relevant data fields.
4. Generate a Korean-language draft based on verified facts and original editorial input.
5. Check whether each factual claim has evidence; explicitly flag unverified items.
6. Detect duplicate content, thin pages, repeated phrasing, keyword stuffing, and broken links.
7. Validate titles, meta descriptions, headings, internal links, image alt text, and affiliate disclosure.
8. Save the item with `draft` status.
9. Include it in the static build and sitemap only after editorial approval.

### 7.2 Draft deliverables

- Content type and target audience
- Search intent and key questions
- Title options and selected title
- Short summary and meta description
- Heading structure (H1/H2/H3)
- Original article body
- Verified facts and source links
- Unverified details and review checklist
- Related hotel, region, attraction, and guide links
- Image suggestions, rights status, and alt text
- Affiliate-link placement and disclosure
- Last-verified date and editorial notes
- Status, defaulting to `draft`

### 7.3 Recommended hotel-article structure

1. Hotel summary and key characteristics
2. Location and surrounding area
3. Transport access, using verified information only
4. Room types and amenities supported by sources
5. Evidence-based explanation of trip types for which the property may be relevant
6. Considerations and details to verify before choosing
7. Nearby attractions, food, and itinerary ideas
8. Pre-booking checklist
9. Related guides and regional pages
10. Sources and verification date
11. Affiliate disclosure and actual approved links
12. FAQ only when the questions are relevant and can be answered reliably

Never invent a first-hand stay or personal experience. Do not copy user reviews without authorization. Do not fabricate ratings, prices, or availability that the API does not provide.

### 7.4 Recommended attraction-article structure

- Overview and reasons to visit
- Location and official website
- Opening hours, closure days, and fees only when supported by official sources and a verification date
- How to get there, using verified transport information
- Practical considerations for a visit
- Nearby attractions and related accommodation
- Official sources and last-checked date
- Related travel guides
- Explicitly marked unknowns

### 7.5 Recommended travel-tip structure

- State the reader's problem clearly
- Explain who the advice applies to and any exceptions
- Give actionable steps
- Cite sources and dates for changing costs, times, and policies
- Common mistakes and cautions
- Official references
- Related hotel, region, and attraction pages
- FAQ and update history

## 8. SEO and Google Search quality

Treat SEO as a way to answer user questions accurately and originally, not as repeated keyword insertion.

- Create a unique `<title>` and meta description for each public page.
- Generate canonical URLs consistently from `https://cozytrip.kr`.
- Configure Open Graph and social-sharing metadata.
- Validate XML sitemap, `robots.txt`, 404 behavior, canonicals, and redirects.
- Include only public, approved, indexable pages in the sitemap.
- Apply `noindex` to drafts, internal search results, or tool pages where appropriate, and exclude them from the sitemap.
- Use one clear H1 and a logical H2/H3 hierarchy.
- Add useful contextual links among hotels, regions, attractions, and guides.
- Manage image filenames, dimensions, formats, and alt text appropriately.
- Consider mobile performance, Core Web Vitals, accessibility, and layout stability.
- Detect duplicate slugs, broken internal links, orphan pages, empty content, and duplicate titles.
- Use structured data such as `WebSite`, `Organization`, and `BreadcrumbList` only when consistent with the actual page.
- Never invent `Review`, `AggregateRating`, price, rating, or inventory data in JSON-LD.
- Never guarantee search rankings or AdSense approval.

### 8.1 Originality and usefulness

- Go beyond restating official sources by adding useful comparison criteria, decision checklists, route context, cautions, and explanations.
- Do not mass-produce template pages that differ only by city or hotel name.
- Avoid unsupported claims such as “best,” “cheapest,” “perfect,” or “I personally visited.”
- Fact-check and editorially review AI-generated copy.
- Check whether a page deserves publication and whether it duplicates existing content.
- If a record lacks enough useful information, enrich it or keep it unpublished rather than forcing a thin page.

## 9. Google AdSense design

- Do not imply that ads are active before approval.
- Manage the publisher/client ID and ad-slot IDs through environment variables.
- Choose names that match the actual project and document them in `.env.example`.
- The site must work without errors when variables are absent or ads are disabled.
- Clearly distinguish ads from editorial content; never encourage clicks.
- Do not make ad units look like navigation, buttons, or affiliate links.
- Reserve ad space to reduce layout shifts.
- Check privacy-policy, cookie/consent, and regional requirements against the actual ad setup and visitor regions.
- Do not guarantee approval or revenue.
- Do not mass-publish thin pages primarily to display ads.

## 10. Affiliate disclosure and privacy

- Place understandable affiliate disclosure near relevant affiliate links.
- Ensure the disclosure, tracking behavior, and privacy policy match the actual implementation.
- Do not claim the site collects personal data unless it really does.
- Use appropriate `rel` attributes for external links.
- Follow third-party terms, image licenses, and API storage/caching rules.
- If forms or analytics are added, review the actual data collected, purpose, retention, and third-party sharing.

## 11. Content-management tools and operational automation

The content tool may be a `/studio/` interface or a CLI. Choose based on the existing architecture and security requirements.

Required capabilities:

- Select hotel, region, attraction, or guide content type
- Validate input and schemas
- Preview imported API results
- Generate drafts and export Markdown
- Manage sources and editorial notes
- Validate duplicate slugs and region references
- Change status and run pre-publication checks
- Confirm before overwriting or generate safe unique filenames
- Summarize generated/updated records and errors
- Keep secrets out of browser code
- Explain accurately where data is stored and whether it persists

Draft generation alone must not trigger public publication, paid external API calls, bookings, or purchases. File-writing tools must defend against path traversal, unintended overwrites, and HTML injection.

## 12. File and directory organization

Inspect the actual project before designing the final structure. The following is an example of functional separation, not a requirement to rewrite an existing repository blindly.

```text
src/
  components/
    layout/
    navigation/
    hotel/
    region/
    attraction/
    guide/
    affiliate/
    ads/
    seo/
  layouts/
  pages/
    hotels/
    regions/
    attractions/
    guides/
    categories/
    search/
  content/
    hotels/
    regions/
    attractions/
    guides/
  data/
    categories/
  lib/
    content/
    seo/
    validation/
    affiliate/
    images/
  schemas/
functions/         # only if server-side APIs are actually needed
scripts/
  content-draft.ts
  content-validate.ts
  check-links.ts
  import-agoda.ts
tests/
docs/
```

- Choose the concrete `src/content` format after checking the Astro version and compatibility with features such as Astro Content Collections.
- Write scripts in Bun + TypeScript.
- Separate API adapters from domain data models.
- Never copy a dedicated page component for every hotel.
- Document file paths, slug rules, and image naming conventions.
- Confirm actual Astro, UnoCSS, and Bun versions before finalizing architecture.
- Do not create ordinary CSS files. An example directory name must not override the no-CSS rule.

## 13. Recommended commands and automated validation

Implement scripts appropriate to the real project:

- `bun run dev`
- `bun run check`
- `bun test`
- `bun run build`
- `bun run preview`
- `bun run format`
- `bun run content:validate`
- `bun run content:draft`
- `bun run content:import` when authorized API access and configuration exist
- `bun run seo:check` or an equivalent validation command

Automate these checks:

1. Astro and TypeScript checks
2. Tests
3. Production build
4. Runtime schema validation for content
5. Duplicate slug detection
6. Validation of referenced regions, attractions, and related content
7. Consistency between approval status, public pages, and sitemap
8. Broken internal links and duplicate metadata
9. Canonical and sitemap domain validation
10. Stale brand/domain strings such as `cozymoney.kr`
11. Attributify configuration and violations of the no-ordinary-CSS rule
12. OKLCH design-token validation
13. Ensure `.env`, tokens, and API keys are not committed
14. Missing image source, alt text, or rights metadata
15. Distinguish real affiliate links from mock links

Fix failures and rerun checks. Mark checks that could not run as **not run**.

## 14. Performance, accessibility, and security

### Performance

- Prefer static pages.
- Use suitable image sizes and formats and lazy-load non-critical imagery.
- Prioritize the hero image only when justified by actual performance needs.
- Avoid unnecessary client JavaScript, large dependencies, and oversized JSON payloads.
- Reserve space for ads and images to reduce CLS.

### Accessibility

- Semantic HTML landmarks and heading order
- Explicit labels for all forms
- Visible keyboard focus
- Purposeful alt text
- Do not communicate information through color alone
- Adequate contrast and touch targets
- Verify every component in dark mode
- Minimize motion and respect reduced-motion preferences

### Security

- Access API keys only on the server.
- Never log secrets.
- Validate external input and API responses.
- Avoid rendering arbitrary HTML without sanitization.
- Review content tools for path, overwrite, and injection risks.
- Document environment variables separately for Preview and Production.
- Never expose an administrative tool without real authentication and access control when required.

## 15. Documentation and deployment

Create or update these documents:

- `README.md`: required versions, setup, development, tests, build, directory structure
- `.env.example`: variable names, purposes, and where they are configured; no real secrets
- `docs/content-workflow.md`: drafting, review, and publishing
- `docs/agoda-integration.md`: access prerequisites, API setup, security, and limitations
- `docs/adsense.md`: pre- and post-approval setup and ad slots
- `docs/seo.md`: sitemap, canonical, and Search Console checks
- `docs/deployment.md`: Cloudflare Pages and Preview/Production configuration
- `docs/editorial-policy.md`: sourcing, fact-checking, and AI review
- Test results and unresolved limitations

If Cloudflare Pages is used, align the build command, output directory, Bun version, environment variables, and Functions configuration with the actual project. Do not claim account configuration is complete without verifying it.

## 16. Deliverables and definition of done

The final report must include:

- Implemented features and changed files
- Data model and instructions for adding content
- Actual Agoda API status: connected, awaiting permission, or unverified
- AdSense configuration status without assuming approval
- Draft/review/publish workflow
- Actual results of executed checks, tests, and build
- Skipped checks, remaining manual tasks, and known limitations
- Environment-variable names and configuration locations
- A complete project ZIP when appropriate

Definition of done:

- [ ] Astro + Bun + TypeScript architecture retained
- [ ] UnoCSS Attributify used consistently
- [ ] No authored ordinary CSS, Astro `<style>` blocks, or inline `style` attributes
- [ ] All authored design-color tokens use OKLCH
- [ ] OS-based dark mode and responsive UI work
- [ ] Hotel, region, attraction, and guide data are separated from page code
- [ ] Content status, sources, verification dates, and approval workflow are implemented
- [ ] Unverified prices, ratings, reviews, availability, and transport facts are not presented as facts
- [ ] API secrets are not exposed to clients or Git
- [ ] Real approved affiliate links are distinguishable from mock data
- [ ] SEO metadata, canonical, sitemap, and robots are checked
- [ ] AdSense slots safely reflect actual approval/configuration status
- [ ] Draft automation checks duplication, thin content, and missing sources
- [ ] Checks, tests, and build are reported from actual evidence
- [ ] Operational documentation and outstanding work are included

**Start by inspecting the repository and current branch, then compare the implementation against these requirements. Finalize the data, content, API, SEO, and monetization architecture, implement in small verifiable steps, and validate the result.**
