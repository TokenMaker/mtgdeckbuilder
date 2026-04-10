# MTG AI Deck Builder — Full Build Specification v2.0

> **Target:** Claude Code / Cursor / Google Project IDX / Replit  
> **Version:** 2.0.0  
> **Description:** A full-stack AI-powered Magic: The Gathering platform. Features a public marketing homepage, authenticated deck builder, user profiles with win-rate tracking, AI-assisted deck building, meta deck imports from top MTG sites, and a resizable three-panel workspace.

---

## What's New in v2.0

- **Homepage** — Public marketing landing page with features, trending decks, and CTA
- **User Profiles** — Account dashboard with deck history and win/loss tracking
- **Deck builder requires account** — Deck building is tied to user profiles
- **Resizable panels** — Drag dividers to resize chat / card results / deck list panels
- **Card search bar** — Dedicated manual search in the card results panel
- **Format-locked AI** — AI only suggests cards legal in the selected format
- **AI chat limits** — Per-user daily message cap to control API costs
- **Improved AI logic** — Richer deck analysis, proactive suggestions, better reasoning
- **Meta deck imports** — Pull real tournament decks from MTGTop8 and MTGDecks.net
- **UI redesign** — Refined dark theme per updated design direction

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS | React Router v6, Lucide React icons, Recharts |
| State | React useState + useContext | No Redux needed |
| Backend | Node.js 20+ / Express.js | Claude proxy, auth middleware, deck CRUD, scraper proxy |
| Database | Supabase | PostgreSQL + Auth (email & Google OAuth) + Row Level Security |
| Card Data | Scryfall API | Free, no key — `https://api.scryfall.com` |
| AI | Anthropic Claude `claude-sonnet-4-20250514` | Server-side only — `ANTHROPIC_API_KEY` never exposed to client |
| Scraping | Cheerio + Axios (backend) | Parse MTGTop8 and MTGDecks.net HTML server-side |
| Hosting | Vercel (frontend) + Railway or Render (backend) | |

### Scryfall Key Endpoints
- `GET /cards/search?q={query}` — main search
- `GET /cards/named?fuzzy={name}` — fuzzy name lookup
- `GET /cards/{id}` — single card by ID

> ⚠️ Scryfall rate limit: max 10 req/sec. Add 50–100ms delay between sequential calls. Use LRU cache (5 min TTL) on backend.

---

## Project Structure

```
mtg-deck-builder/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx               # Public marketing landing page
│   │   │   ├── BuilderPage.jsx            # Deck builder workspace (auth required)
│   │   │   ├── ProfilePage.jsx            # User profile + deck history
│   │   │   └── DeckDetailPage.jsx         # Single deck view + match log
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx             # Global nav: logo, links, login/avatar
│   │   │   │   ├── Footer.jsx             # Site footer
│   │   │   │   └── ResizablePanels.jsx    # Drag-to-resize three-panel container
│   │   │   ├── home/
│   │   │   │   ├── HeroSection.jsx        # Headline, subtext, CTA buttons
│   │   │   │   ├── FeaturesSection.jsx    # Feature cards grid
│   │   │   │   ├── TrendingDecks.jsx      # Live trending decks from meta sites
│   │   │   │   ├── BrewCTA.jsx            # "Ready to Brew?" section + signup button
│   │   │   │   └── TestimonialsSection.jsx
│   │   │   ├── builder/
│   │   │   │   ├── BuilderHeader.jsx      # Format selector, deck name, count, save, export
│   │   │   │   ├── ChatPanel.jsx          # AI conversation panel
│   │   │   │   ├── ChatMessage.jsx        # Individual message bubble
│   │   │   │   ├── ChatInput.jsx          # Input + send + daily limit indicator
│   │   │   │   ├── ChatLimitBanner.jsx    # Warning when user is near/at daily limit
│   │   │   │   ├── CardPanel.jsx          # Card results panel container
│   │   │   │   ├── CardSearchBar.jsx      # Manual search bar inside card panel
│   │   │   │   ├── CardGrid.jsx           # Thumbnail grid
│   │   │   │   ├── CardThumbnail.jsx      # Card image + hover enlarge
│   │   │   │   ├── CardDetailModal.jsx    # Add to deck popup
│   │   │   │   ├── CardImage.jsx          # Double-faced card handler
│   │   │   │   ├── MetaImportModal.jsx    # Import deck from MTGTop8 / MTGDecks
│   │   │   │   ├── DeckPanel.jsx          # Deck list right panel
│   │   │   │   ├── DeckGroup.jsx          # Section: Creatures (12)
│   │   │   │   ├── DeckCardRow.jsx        # 4x Lightning Bolt [±] [x]
│   │   │   │   ├── DeckStats.jsx          # Count, color pips, warnings
│   │   │   │   ├── ManaCurveChart.jsx     # CMC bar chart (Recharts)
│   │   │   │   └── SideboardSection.jsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileHeader.jsx      # Avatar, username, stats summary
│   │   │   │   ├── DeckLibrary.jsx        # Grid of user's saved decks
│   │   │   │   ├── DeckCard.jsx           # Deck thumbnail card (name, format, record)
│   │   │   │   ├── WinRateChart.jsx       # Win rate over time (Recharts)
│   │   │   │   └── MatchLogger.jsx        # Log a match result (W/L/D + notes)
│   │   │   ├── auth/
│   │   │   │   ├── LoginModal.jsx
│   │   │   │   ├── SignupModal.jsx
│   │   │   │   └── AuthProvider.jsx
│   │   │   └── shared/
│   │   │       ├── ExportModal.jsx
│   │   │       ├── Toast.jsx
│   │   │       └── ConfirmDialog.jsx
│   │   ├── hooks/
│   │   │   ├── useDeck.js
│   │   │   ├── useScryfall.js
│   │   │   ├── useChat.js                 # Includes daily limit logic
│   │   │   ├── useFormat.js
│   │   │   ├── usePanelResize.js          # Drag-to-resize panel widths
│   │   │   └── useMatchLog.js
│   │   ├── utils/
│   │   │   ├── formatRules.js
│   │   │   ├── deckExport.js
│   │   │   ├── cardGrouping.js
│   │   │   └── metaParser.js             # Parse imported meta deck text
│   │   ├── context/
│   │   │   ├── DeckContext.jsx
│   │   │   ├── FormatContext.jsx
│   │   │   └── ChatLimitContext.jsx       # Track daily message count
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── chat.js                        # POST /api/chat — Claude proxy + limit check
│   │   ├── decks.js                       # CRUD for saved decks
│   │   ├── scryfall.js                    # Scryfall proxy
│   │   ├── meta.js                        # GET /api/meta/trending, /api/meta/import
│   │   ├── matches.js                     # POST/GET match results
│   │   └── profile.js                     # GET /api/profile/:id
│   ├── middleware/
│   │   ├── auth.js                        # Verify Supabase JWT
│   │   └── rateLimit.js
│   ├── services/
│   │   ├── claudeService.js
│   │   ├── scryfallService.js
│   │   └── metaScraper.js                 # Cheerio scrapers for MTGTop8 + MTGDecks
│   ├── server.js
│   └── package.json
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_match_tracking.sql
├── .env.example
└── README.md
```

---

## Routing

| Route | Page | Auth |
|---|---|---|
| `/` | HomePage | Public |
| `/builder` | BuilderPage | **Required** — redirect to login if not authenticated |
| `/builder/:deckId` | BuilderPage with loaded deck | **Required** |
| `/profile/:username` | ProfilePage | Public (view) — edit requires own account |
| `/decks/:deckId` | DeckDetailPage | Public (view) |

> The deck builder is **only accessible to logged-in users**. Visiting `/builder` while logged out redirects to `/` with a login modal open and a message: _"Create a free account to start building."_

---

## Homepage (`/`)

The homepage is a public marketing page. It does not require auth and serves as the main entry point for new visitors.

### Sections in order:

#### 1. Navbar
- Logo left, nav links center (Home · Features · Trending · Pricing), Login / Sign Up buttons right
- On scroll: navbar becomes sticky with a backdrop blur / semi-transparent dark background
- If logged in: show avatar + "Go to Builder" CTA instead of login buttons

#### 2. Hero Section
- Full-width dark background with subtle MTG card art texture or gradient overlay (deep navy to black)
- Large headline: **"Build Better Decks with AI"**
- Subheadline: _"Collaborate with AI to find the right cards, build tournament-ready decks, and track your results — all in one place."_
- Two CTA buttons: **"Start Brewing Free"** (primary, amber) → triggers signup modal · **"See How It Works"** (secondary, outline) → smooth scroll to features
- Animated card fan or floating card images as hero visual (CSS animation)

#### 3. Features Section
Six feature cards in a 3-column grid:

| Icon | Title | Description |
|---|---|---|
| 🤖 | AI Deck Collaborator | Chat naturally to find cards, get suggestions, and analyze your deck in real time |
| 🃏 | 30,000+ Cards | Powered by Scryfall — every card, every set, with full legality data |
| ⚖️ | Format Enforcement | Automatic legality checks for Standard, Modern, Commander, Legacy, and more |
| 📊 | Meta Insights | Import top tournament decks from MTGTop8 and MTGDecks.net |
| 📈 | Win Rate Tracking | Log your matches and track how your decks perform over time |
| 💾 | Deck Library | Save, manage, and export your decks in MTGO/Arena format |

#### 4. Trending Decks Section
- Section title: **"What the Meta is Playing"**
- Format filter tabs: All · Standard · Modern · Pioneer · Legacy · Commander
- 4–6 deck cards fetched from backend (`GET /api/meta/trending`) — sourced from MTGTop8/MTGDecks
- Each deck card shows: deck name, format badge, archetype tag (Aggro/Control/Combo/Midrange), source site, color identity pips, "View Deck" button
- "View Deck" opens a read-only deck detail modal or navigates to DeckDetailPage
- Refresh button to load fresh meta data
- Bottom link: _"See all trending decks →"_

#### 5. "Ready to Brew?" CTA Section
- Dark card with amber/gold accent border
- Headline: **"Your Next Championship Deck Starts Here"**
- Body: _"Join thousands of players using AI to take their brewing to the next level."_
- **"Create Free Account"** button (large, amber) → signup modal
- Small print: _"Free forever. No credit card required."_

#### 6. Footer
- Logo, brief tagline
- Links: Features · Pricing · Privacy Policy · Terms of Service
- Social icons (Twitter/X, Discord, Reddit)
- Copyright

---

## Builder Page (`/builder`)

### Auth Gate
If user is not authenticated: redirect to `/` and open login modal with message _"Sign in to access the deck builder."_

### Builder Header (fixed, full width)
| Position | Element |
|---|---|
| Left | Back arrow → Homepage, App logo |
| Center-left | Format selector dropdown |
| Center | Editable deck name input (click to edit, auto-saves on blur) |
| Center-right | Live card count badge `58 / 60` — red if invalid, green if valid |
| Right | Import Meta Deck button · Save · Export |
| Far right | User avatar → profile dropdown |

### Resizable Three-Panel Layout

The three panels are separated by draggable divider handles. Users can drag the dividers left or right to redistribute panel widths to their preference.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Header: Format | Deck Name | Count | Import | Save | Export | Avatar │
├──────────────────╫──────────────────────────╫────────────────────────┤
│   CHAT PANEL     ║    CARD RESULTS PANEL     ║    DECK LIST PANEL     │
│   (default 28%)  ║    (default 42%)          ║    (default 30%)       │
│                  ║                           ║                        │
│ ← drag handle →  ║  ← drag handle →          ║                        │
└──────────────────╫──────────────────────────╫────────────────────────┘
```

**Resize behavior:**
- Implement with `usePanelResize` hook using `mousedown` / `mousemove` / `mouseup` events on divider elements
- Minimum panel width: 20% — no panel can collapse below this
- Maximum panel width: 60% — prevents a single panel from dominating
- Divider styling: 4px wide, `bg-gray-700` default, `bg-amber-400` on hover/drag, cursor changes to `col-resize`
- Panel widths persisted to `localStorage` so user's preference is remembered across sessions
- Double-click a divider to reset panels to default widths (28/42/30)

#### Chat Panel
- Scrollable message history — user messages right-aligned (amber bubble), AI messages left-aligned (gray bubble)
- AI messages can contain **card name chips** — clickable inline references that trigger a card detail popup
- Animated typing indicator (three bouncing dots) while AI is responding
- **Daily limit indicator** — small counter below input: `"12 / 20 messages used today"` — turns amber at 80%, red at 100%
- `ChatLimitBanner` shown when user hits 80% of limit: _"You're running low on AI messages for today. They reset at midnight."_
- When limit is reached: input is disabled, message shown: _"You've used all your AI messages for today. They reset at midnight UTC."_ with upgrade prompt for premium
- Suggested prompt chips above input (shown when chat is empty): "Show me cheap removal", "What creatures fit this deck?", "Suggest a land package", "Analyze my deck"
- Input: text field + Send button (Enter to send, Shift+Enter for newline)

#### Card Results Panel
- **Panel header bar** with:
  - Panel title showing search context: _"Results: cheap removal in Modern"_ (or "Browse Cards" when idle)
  - **Manual search bar** — text input with search icon, placeholder: _"Search cards by name, type, or effect..."_ — triggers Scryfall search independently of AI chat
  - Filter chips below search bar: Type (All · Creature · Instant · Sorcery · Land · ...) · CMC (Any · 1 · 2 · 3 · 4+) · Color (WUBRG + Colorless)
  - Sort dropdown: Relevance · Name · CMC · Color
- Responsive card grid (columns adjust to panel width: 2 cols narrow → 4 cols wide)
- Each thumbnail: Scryfall card image, card name below image
- **Hover effect:** CSS-only `transform: scale(1.9)` with `z-index: 50`, `position: absolute`. Transform origin adjusts based on card's position in the grid (cards on left edge enlarge right, right edge enlarge left, top row enlarges down). Never clips viewport edge.
- Legality badge on each card: ✅ legal · ❌ illegal · ⚠️ banned
- Click → opens CardDetailModal
- Loading skeleton placeholders (animated shimmer) while fetching
- Empty state when no search has run — centered icon + text: _"Ask the AI or search above to find cards"_
- Pagination: "Load more" button at bottom, or infinite scroll

#### Deck List Panel
- Grouped sections with collapsible headers: Creatures · Instants · Sorceries · Enchantments · Artifacts · Planeswalkers · Lands
- Each section header shows section card count: **Creatures (14)**
- Each card row: `[qty badge]  Card Name  [mana pips]  [–][+]  [×]`
- Click card name → CardDetailModal (view mode)
- Sideboard section below main deck (60-card formats only), collapsible
- Commander zone at top (Commander format only) — special gold-bordered slot
- Mana curve bar chart (CMC 0 through 7+) using Recharts — compact height
- Color identity row: colored circle pips showing deck's color composition
- Warning banners (dismissible per session):
  - 🔴 Illegal card in format
  - 🟠 Banned card present
  - 🟡 Over 4 copies of a card
  - 🔴 Deck under/over card count limit
- Sticky footer: total main deck count · sideboard count · validity indicator

---

## Card Detail Modal

Triggered by clicking any card thumbnail in the results grid OR clicking a card name in the deck list.

| Element | Detail |
|---|---|
| Card image | Large — `image_uris.large`. Double-faced cards have a flip toggle button. |
| Card info | Name, mana cost, type line, set name + symbol, oracle text, P/T or loyalty |
| Rulings link | "View rulings on Scryfall ↗" external link |
| Legality badge | Badge for currently selected format: Legal / Not Legal / Banned / Restricted |
| Quantity input | Number input · min 1 · max 4 (1 for Commander · unlimited for basic lands) |
| AI Suggest Qty | Button → backend call with full deck context → returns recommended qty + one-sentence reasoning shown in amber callout below input |
| Add to Main Deck | Primary amber button — **disabled + tooltip if card is illegal** |
| Add to Sideboard | Secondary button — 60-card formats only |
| Illegal banner | Red banner: _"[Card] is not legal in [Format]"_ |
| Banned banner | Orange banner: _"[Card] is banned in [Format] — for casual play only"_ |
| Close | × button top-right or click outside |

---

## Format Rules Engine

All rules enforced in real time. Use `card.legalities[formatKey]` from Scryfall response.

### Format Configurations

| Format | Min Size | Max Copies | Sideboard | Singleton | Special Rules |
|---|---|---|---|---|---|
| Standard | 60 | 4 | 15 | No | — |
| Modern | 60 | 4 | 15 | No | — |
| Pioneer | 60 | 4 | 15 | No | — |
| Legacy | 60 | 4 | 15 | No | — |
| Vintage | 60 | 4 | 15 | No | Restricted list enforced (max 1 copy) |
| Commander | 100 | 1 | No | Yes | Color identity lock, Commander slot |
| Pauper | 60 | 4 | 15 | No | Commons only (`card.rarity === "common"`) |

### Validation Rules

**`illegal_card`** — `card.legalities[format] !== "legal"` → **block add**. Red banner: _"[Card] is not legal in [Format]."_

**`banned_card`** — `card.legalities[format] === "banned"` → **warn, allow add** (casual). Persistent orange badge in deck list row.

**`restricted_card`** — Vintage only. Max 1 copy. Block second add with: _"[Card] is restricted to 1 copy in Vintage."_

**`max_copies`** — Enforce per-format limit. Exceptions:
- `card.type_line.includes("Basic Land")` → unlimited
- `card.oracle_text` includes `"A deck can have any number of copies"` → unlimited (e.g. Relentless Rats)

**`deck_size`** — Header badge turns red when invalid. Block save (not add) when invalid.

**`commander_color_identity`** — Check `card.color_identity` array vs commander's. Block if any color falls outside commander's identity. Use `color_identity`, NOT `colors`.

**`commander_slot`** — Commander zone is separate. Must be Legendary Creature OR oracle text includes `"can be your commander"`.

**`pauper_rarity`** — `card.rarity !== "common"` → block with: _"Only common-rarity cards are allowed in Pauper."_

---

## AI Chat System

### Format Lock
**All AI suggestions must be locked to the currently selected format.** Every Scryfall query generated by the AI must include the format filter (e.g. `format:modern`). If the user asks about a card that is not legal in the selected format, the AI should acknowledge it and suggest a legal alternative, not show the illegal card.

### Tiers

**Free** — Smart search + basic assistance:
- Interpret natural language → valid Scryfall query
- Suggest cards legal in selected format only
- Answer MTG rules questions
- Explain what cards do
- Suggest quantity on request

**Premium** — Full collaborator (all free features plus):
- Proactive deck analysis after each card add
- Identify archetype gaps: _"You have no interaction — consider adding removal"_
- Synergy detection: _"These three cards combo well together"_
- Budget alternatives: _"Fetchlands are expensive — consider these alternatives"_
- Full deck review on request
- Higher daily message limit

### AI Chat Daily Limits

Tracked per user in Supabase `chat_usage` table (resets at midnight UTC).

| Tier | Daily Message Limit |
|---|---|
| Free (unauthenticated) | 5 messages (session only, no persistence) |
| Free (authenticated) | 20 messages per day |
| Premium | 100 messages per day |

**Implementation:**
- Backend checks `chat_usage` before processing each message
- If at limit: return `HTTP 429` with `{ limitReached: true, resetAt: "midnight UTC" }`
- Frontend shows `ChatLimitBanner` and disables input
- Counter shown in chat panel: `"12 / 20 messages used today"`
- Usage stored in `chat_usage` table: `{ user_id, date, count }`

### Backend Chat Endpoint

`POST /api/chat` — requires auth JWT

**Request:**
```json
{
  "message": "show me good 2-drop creatures for my deck",
  "conversationHistory": [{ "role": "user|assistant", "content": "..." }],
  "currentDeck": {
    "mainboard": [...cardObjects],
    "sideboard": [...cardObjects],
    "commander": null,
    "format": "modern"
  },
  "selectedFormat": "modern",
  "isPremium": false
}
```

**Response:**
```json
{
  "message": "Here are strong 2-drop creatures in Modern...",
  "scryfallQuery": "t:creature cmc=2 format:modern",
  "cards": [...scryfallCardObjects],
  "suggestedQuantity": null,
  "suggestedQuantityReasoning": null,
  "action": "search | analyze | answer | suggest_quantity",
  "messagesUsedToday": 13,
  "messagesLimit": 20
}
```

### AI System Prompt

```
You are an expert Magic: The Gathering deck building assistant built into a deck builder app.
You help users find cards, understand synergies, and build strong decks.

CRITICAL RULE: You ONLY suggest cards that are legal in the user's selected format.
NEVER suggest a card that is banned or not legal in {{FORMAT}}. If asked about an illegal card,
acknowledge it and suggest a legal alternative in the same role.

ALWAYS respond in valid JSON only — no preamble, no markdown, no code fences:
{
  "message": "Conversational response shown in chat — explain cards, give context, be helpful",
  "scryfallQuery": "valid scryfall query string OR null if no card search needed",
  "action": "search | analyze | answer | suggest_quantity",
  "suggestedQuantity": null or integer,
  "suggestedQuantityReasoning": null or short string
}

Scryfall query syntax (always include format filter):
  format:{{FORMAT_KEY}}          — always include this
  t:creature                     — card type
  cmc<=2                         — converted mana cost
  c:r                            — color (r=red, u=blue, b=black, g=green, w=white)
  o:"draw a card"                — oracle text contains
  o:"destroy target creature"    — removal
  r:rare r:common                — rarity
  pow>=3 tou>=3                  — power/toughness
  is:commander                   — valid commanders (for Commander format)

Current format: {{FORMAT}} (Scryfall key: {{FORMAT_KEY}})
Current deck summary: {{DECK_SUMMARY}}
Deck archetype hints: {{ARCHETYPE_HINTS}}
User tier: {{TIER}}

Behavior guidelines:
- Free users: answer the specific question, keep it focused
- Premium users: after each card search, include a brief proactive insight about deck composition
- Always reference specific card names when making suggestions
- When suggesting a land package, calculate the right count based on average CMC
- When the deck is near complete, offer a sideboard suggestion if applicable
- Be concise but informative — players want help, not a lecture
- Never expose raw Scryfall query syntax to the user
- If the user asks to analyze the deck, reference the actual cards in {{DECK_SUMMARY}}
```

### Chat Flow

1. User types message → frontend POSTs to `/api/chat`
2. Backend checks daily message limit — if exceeded, return 429
3. Backend builds system prompt with current format, deck summary, tier
4. Claude returns JSON with `message` + optional `scryfallQuery`
5. If `scryfallQuery` is present: backend calls Scryfall (with format filter enforced server-side as a double-check), appends `cards` array to response
6. Backend increments `chat_usage` count for user
7. Frontend: displays AI message in chat panel, pushes cards to card results panel
8. Frontend updates `messagesUsedToday` counter in chat input area

---

## Meta Deck Import

Users can import real tournament decks from MTGTop8 and MTGDecks.net.

### Import Modal (`MetaImportModal`)
- Accessible via **"Import Meta Deck"** button in builder header
- Two tabs: **MTGTop8** and **MTGDecks.net**
- Format filter automatically set to currently selected format
- Shows a list of recent top-performing decks (fetched from `GET /api/meta/trending?format=modern`)
- Each entry: Deck name, archetype tag, pilot name (if available), event name, date, color pips, "Import" button
- "Import" replaces current deck (with confirm dialog if deck has cards)
- Alternative: paste a raw deck list in MTGO text format → "Parse & Import" button

### Backend Meta Scraper (`metaScraper.js`)

**MTGTop8** — `https://mtgtop8.com`
- Scrape format-specific top 8 lists using Cheerio
- Parse deck names, archetypes, card lists from the HTML structure
- Cache results for 1 hour to avoid hammering the site
- Endpoint: `GET /api/meta/trending?format=modern&source=mtgtop8`

**MTGDecks.net** — `https://mtgdecks.net`
- Scrape top decks by format
- Parse deck lists into standard card name + quantity format
- Cache results for 1 hour
- Endpoint: `GET /api/meta/trending?format=modern&source=mtgdecks`

**Important scraping notes:**
- Always add a `User-Agent` header to scraping requests (mimic a browser)
- Respect `robots.txt` — only scrape publicly listed deck data
- If scraping fails (site structure change, timeout, block), return cached data or a graceful fallback message
- After scraping: resolve each card name against Scryfall `GET /cards/named?fuzzy={name}` to get full card objects (do this in batch with rate limiting)
- Store scraped trending decks in Supabase `trending_decks` table with a TTL — refresh in background job (cron every 6 hours)

**Trending Decks DB table:**
```sql
CREATE TABLE trending_decks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  format      TEXT NOT NULL,
  archetype   TEXT,
  source      TEXT NOT NULL,  -- 'mtgtop8' or 'mtgdecks'
  source_url  TEXT,
  mainboard   JSONB NOT NULL DEFAULT '[]',
  sideboard   JSONB NOT NULL DEFAULT '[]',
  color_identity TEXT[] DEFAULT '{}',
  fetched_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## User Profiles (`/profile/:username`)

### Profile Page Layout

#### Profile Header
- Avatar (from Supabase auth or Gravatar fallback), editable username, join date
- Stats row: **Total Decks · Total Matches · Overall Win Rate · Favorite Format**
- "Edit Profile" button (own profile only)
- "Follow" button (future feature placeholder)

#### Deck Library
- Grid of deck cards (3-column responsive)
- Each deck card shows:
  - Deck name
  - Format badge (color-coded)
  - Color identity pips
  - Win/Loss/Draw record: e.g. `12W – 7L – 1D`
  - Win rate percentage badge: `63% WR`
  - Last updated date
  - "Open in Builder" button · "View Details" button · Delete button (own profile only)
- Filter/sort: by format, by win rate, by date created/updated
- "New Deck" button → navigates to `/builder`

#### Win Rate Chart
- Line chart (Recharts) showing win rate over time across all decks
- Toggle: by deck or aggregate
- Date range selector: Last 30 days · 3 months · All time

---

## Match Tracking (`/decks/:deckId`)

### Deck Detail Page
- Full read-only deck view (card list, mana curve, color identity)
- Match log section below

### Match Logger Component
Users can log a game result against a specific deck.

**Log a match form:**
- Result: Win / Loss / Draw (toggle buttons)
- Opponent's deck/archetype (text input, optional)
- Format (auto-filled from deck)
- Notes (textarea, optional)
- Date (auto-filled, editable)
- Submit button

**Match log table:**
- Date · Result · Opponent Archetype · Notes
- Sortable columns
- Delete row button

**Stats calculated from log:**
- Total matches, wins, losses, draws
- Win rate percentage
- Win rate vs specific archetypes
- Streak (current winning/losing streak)

---

## Database Schema

```sql
-- ── Profiles ────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  is_premium    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Decks ────────────────────────────────────────────────────────────
CREATE TABLE decks (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT 'Untitled Deck',
  format         TEXT NOT NULL,
  mainboard      JSONB NOT NULL DEFAULT '[]',
  sideboard      JSONB NOT NULL DEFAULT '[]',
  commander      JSONB DEFAULT NULL,
  card_count     INTEGER DEFAULT 0,
  color_identity TEXT[] DEFAULT '{}',
  is_valid       BOOLEAN DEFAULT false,
  is_public      BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Card object shape stored in mainboard/sideboard JSONB arrays:
-- { "id": "scryfall_id", "name": "Card Name", "quantity": 4,
--   "mana_cost": "{1}{R}", "type_line": "Instant", "cmc": 2,
--   "image_uris": { "normal": "...", "large": "..." },
--   "legalities": { "modern": "legal" }, "color_identity": ["R"] }

-- ── Matches ──────────────────────────────────────────────────────────
CREATE TABLE matches (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id           UUID REFERENCES decks(id) ON DELETE CASCADE,
  result            TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  opponent_archetype TEXT,
  format            TEXT,
  notes             TEXT,
  played_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat Usage (daily limit tracking) ────────────────────────────────
CREATE TABLE chat_usage (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  count     INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- ── Trending Decks (meta import cache) ───────────────────────────────
CREATE TABLE trending_decks (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  format         TEXT NOT NULL,
  archetype      TEXT,
  source         TEXT NOT NULL,
  source_url     TEXT,
  mainboard      JSONB NOT NULL DEFAULT '[]',
  sideboard      JSONB NOT NULL DEFAULT '[]',
  color_identity TEXT[] DEFAULT '{}',
  fetched_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────
ALTER TABLE decks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own decks"       ON decks      FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Public decks"    ON decks      FOR SELECT USING (is_public = true);
CREATE POLICY "Own matches"     ON matches    FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Own usage"       ON chat_usage FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Own profile"     ON profiles   FOR ALL    USING (auth.uid() = id);
CREATE POLICY "Public profiles" ON profiles   FOR SELECT USING (true);

-- ── Triggers ──────────────────────────────────────────────────────────
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Backend API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | Required | Claude proxy — checks + increments daily limit |
| GET | `/api/decks` | Required | All decks for current user |
| POST | `/api/decks` | Required | Create new deck |
| PUT | `/api/decks/:id` | Required | Update deck (must own) |
| DELETE | `/api/decks/:id` | Required | Delete deck (must own) |
| GET | `/api/decks/:id` | Public (if `is_public`) | View single deck |
| GET | `/api/meta/trending` | Public | Trending decks by format (cached) |
| POST | `/api/meta/import` | Required | Import a meta deck into user's account |
| GET | `/api/profile/:username` | Public | User profile + public deck list |
| GET | `/api/matches/:deckId` | Required | Match log for a deck |
| POST | `/api/matches` | Required | Log a new match result |
| DELETE | `/api/matches/:id` | Required | Delete a match log entry |
| GET | `/api/scryfall/search` | Public | Scryfall proxy with caching |

---

## Authentication & Access

- **Provider:** Supabase Auth
- **Methods:** Email + password, Google OAuth
- Auto-create `profiles` row on sign-up via database trigger

| Feature | Access |
|---|---|
| Homepage + trending decks | Public — no account needed |
| Browse card search | Public — no account needed |
| Deck builder | **Requires account** |
| Save decks | **Requires account** |
| Log match results | **Requires account** |
| AI chat (5 messages/session) | Unauthenticated — session only |
| AI chat (20 messages/day) | Free account |
| Premium AI features + 100 msg/day | Premium account |

---

## Export Format

Standard MTGO / MTG Arena text format:

```
4 Lightning Bolt
4 Goblin Guide
4 Monastery Swiftspear
20 Mountain

Sideboard
2 Grafdigger's Cage
3 Smash to Smithereens
```

Commander format:
```
Commander
1 Atraxa, Praetors' Voice

Deck
1 Doubling Season
1 Vorinclex, Voice of Hunger
...98 more cards
```

- Copy to clipboard
- Download as `[deck-name]-[format].txt`

---

## Environment Variables

**Backend `.env`**
```
ANTHROPIC_API_KEY=           # Never expose to client
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # Server-side only
PORT=3001
FRONTEND_URL=http://localhost:5173
SCRAPER_USER_AGENT=Mozilla/5.0 (compatible; MTGDeckBuilder/2.0)
```

**Frontend `.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3001
```

---

## Design System

**Theme:** Rich dark — deep blacks and charcoal panels evoking MTG Arena. Amber/gold accents for interactive elements, evoking the MTG card frame.

### Color Tokens
| Token | Tailwind | Use |
|---|---|---|
| Page background | `bg-gray-950` / `bg-zinc-950` | App background |
| Panel background | `bg-gray-900` | Chat, card, deck panels |
| Panel border | `border-gray-700` | Panel edges |
| Surface elevated | `bg-gray-800` | Cards, modals, inputs |
| Accent primary | `amber-500` | CTA buttons, active states |
| Accent hover | `amber-400` | Button hover |
| Divider handle | `bg-amber-400` on hover | Resize handles |
| Legal | `green-400` | Legality badges |
| Illegal | `red-400` | Warnings |
| Banned | `orange-400` | Ban warnings |
| User message | `bg-amber-700` | Chat bubbles |
| AI message | `bg-gray-700` | Chat bubbles |
| Text primary | `text-gray-100` | |
| Text secondary | `text-gray-400` | Subtext, labels |

### Mana Symbol Colors
| Symbol | Tailwind |
|---|---|
| W (White) | `bg-yellow-50 text-gray-900` |
| U (Blue) | `bg-blue-600 text-white` |
| B (Black) | `bg-gray-800 text-gray-200` |
| R (Red) | `bg-red-600 text-white` |
| G (Green) | `bg-green-700 text-white` |
| C (Colorless) | `bg-gray-500 text-white` |

### Typography
- **UI font:** Inter or system-ui
- **Display / deck names:** Google Font `Cinzel` (Beleren substitute — used for hero text, deck name, section headers)
- **Card text:** monospace for oracle text in modals

### Component Patterns
- Buttons: rounded-md, amber-500 primary, gray-700 secondary, red-600 danger
- Inputs: `bg-gray-800 border-gray-600 focus:border-amber-500 rounded-md`
- Modals: `bg-gray-900 border border-gray-700 rounded-xl shadow-2xl` with dark backdrop
- Badges: small pill shapes, color-coded per status
- Skeleton loaders: `bg-gray-800 animate-pulse rounded`
- Panel resize divider: `w-1 bg-gray-700 hover:bg-amber-400 cursor-col-resize transition-colors`

---

## Build Order

Work through phases in sequence. Test each phase before proceeding.

### Phase 1 — Foundation & Routing
- [ ] Scaffold Vite + React frontend and Express backend
- [ ] Install all dependencies, configure Tailwind with custom design tokens
- [ ] Set up React Router with all routes (`/`, `/builder`, `/profile/:username`, `/decks/:id`)
- [ ] Build `Navbar` and `Footer` shared components
- [ ] Set up Supabase project and run all migrations
- [ ] Configure environment variables

### Phase 2 — Homepage
- [ ] Build `HeroSection` with animated card visuals
- [ ] Build `FeaturesSection` with 6 feature cards
- [ ] Build `TrendingDecks` component (mock data initially, wire to API in Phase 8)
- [ ] Build `BrewCTA` section
- [ ] Assemble `HomePage` and wire routing

### Phase 3 — Auth
- [ ] Build `AuthProvider` with Supabase session management
- [ ] Build `LoginModal` and `SignupModal`
- [ ] Add auth gate redirect on `/builder` route
- [ ] Test login, signup, Google OAuth, session persistence

### Phase 4 — Card Search Core
- [ ] Build `scryfallService.js` with search, rate limiting, caching
- [ ] Build `CardPanel` with `CardSearchBar` and filter chips
- [ ] Build `CardGrid` with `CardThumbnail` and CSS hover enlarge
- [ ] Build `CardDetailModal`
- [ ] Test manual card search independently of AI

### Phase 5 — Resizable Panels
- [ ] Build `usePanelResize` hook with mousedown/move/up drag logic
- [ ] Build `ResizablePanels` layout component with divider handles
- [ ] Persist panel widths to localStorage
- [ ] Double-click to reset widths
- [ ] Test resize across different viewport sizes

### Phase 6 — Deck Building
- [ ] Build `useDeck` hook with full state management
- [ ] Build `DeckPanel` with grouped sections, inline qty editing
- [ ] Build `ManaCurveChart`
- [ ] Wire `CardDetailModal` add-to-deck flow
- [ ] Implement deck persistence to localStorage

### Phase 7 — Format Enforcement
- [ ] Build `formatRules.js` for all 7 formats
- [ ] Implement legality validation on add
- [ ] Warning banners for illegal / banned / restricted / over-limit
- [ ] Commander color identity + commander slot
- [ ] Pauper rarity enforcement
- [ ] Live header card count badge

### Phase 8 — AI Chat + Limits
- [ ] Build `claudeService.js` with format-locked system prompt
- [ ] Build `/api/chat` route with daily limit check + increment
- [ ] Build `ChatPanel`, `ChatMessage`, `ChatInput`
- [ ] Build `ChatLimitBanner` and limit counter display
- [ ] Wire AI response → card results panel
- [ ] Suggested prompt chips
- [ ] Test format-lock: AI must not suggest illegal cards

### Phase 9 — Meta Deck Import
- [ ] Build `metaScraper.js` with Cheerio for MTGTop8 and MTGDecks.net
- [ ] Build `/api/meta/trending` endpoint with caching
- [ ] Populate `trending_decks` Supabase table
- [ ] Build `MetaImportModal` with format-filtered deck list
- [ ] Wire "Import" button to replace current deck (with confirm dialog)
- [ ] Wire trending decks section on Homepage

### Phase 10 — Saving & Profiles
- [ ] Build `/api/decks` CRUD routes
- [ ] Wire Save button in builder header
- [ ] Build `ProfilePage` with `ProfileHeader` and `DeckLibrary`
- [ ] Build `WinRateChart`
- [ ] Build match logging: `MatchLogger` component + `/api/matches` routes
- [ ] Build `DeckDetailPage` with match log table

### Phase 11 — Premium Features
- [ ] Add `is_premium` flag to auth context
- [ ] Gate proactive AI deck analysis for premium users
- [ ] Premium upgrade UI prompt in chat panel
- [ ] Higher daily message limit for premium
- [ ] "AI Suggest Quantity" in CardDetailModal

### Phase 12 — Polish
- [ ] Loading skeletons everywhere (card grid, deck list, profile)
- [ ] Toast notifications (saved · added · error · limit warning)
- [ ] Error states and empty states for all components
- [ ] Responsive layout (mobile nav, stacked panels on tablet)
- [ ] Keyboard accessibility (Escape closes modals, Enter sends chat)
- [ ] Debounce card search input (300ms)
- [ ] Memoize `CardThumbnail` components with `React.memo`
- [ ] SEO meta tags on Homepage

---

## Critical Implementation Notes

**Resizable panels** — Use `useRef` for panel container and divider elements. Track drag state with `isDragging` boolean. On `mousemove`, calculate new widths as percentages of total container width. Clamp between 20% and 60%. Apply widths as inline `style={{ width: '42%' }}` — not Tailwind classes (they can't be dynamic at runtime). Clean up event listeners on `mouseup` and component unmount.

**Format-locked AI** — The backend must enforce the format filter on every Scryfall call triggered by the AI, even if the AI's generated query omits it. After parsing the AI's `scryfallQuery`, always append ` format:{{formatKey}}` server-side before calling Scryfall.

**AI daily limits** — Use `INSERT INTO chat_usage ... ON CONFLICT (user_id, date) DO UPDATE SET count = chat_usage.count + 1` for atomic increment. Check count before calling Claude — don't call Claude if limit exceeded.

**Meta scraping** — Wrap all scraping in try/catch. If a scrape fails, return the cached data from `trending_decks` table. Never let a scraping failure break the homepage or builder. Log scraping errors server-side for monitoring.

**Card hover z-index** — CSS only. Use `group-hover:scale-[1.9]` with Tailwind or inline style. Set `transform-origin` dynamically based on column position: `transform-origin: left center` for right-column cards, `transform-origin: right center` for left-column cards, `transform-origin: center` for middle. This prevents viewport clipping.

**Commander color identity** — Always use `card.color_identity` (not `card.colors`). Color identity includes mana symbols in rules text. Example: Sol Ring has `color_identity: []` (colorless), but a card with `{G}` in its activated ability has `color_identity: ["G"]` even if its casting cost is colorless.

**Basic lands** — `card.type_line.includes("Basic Land")` → unlimited copies. Includes Snow-Covered variants (Snow-Covered Forest etc.) and Wastes.

**Claude JSON parsing** — Always `try/catch` around `JSON.parse`. On failure, treat full response text as `message` with `scryfallQuery: null`. Strip markdown code fences before parsing.

**Supabase RLS** — Service role key is backend only — it bypasses RLS. Anon key goes to frontend. Never swap these. All user data tables must have RLS enabled with policies.

**Deck localStorage** — Key: `mtg_deck_draft`. Save after every card add/remove. Load on builder mount if no `deckId` param. Clear after successful Supabase save. Prompt user on load: _"We found an unsaved draft. Continue where you left off?"_

**Image fallback** — All `<img>` tags for card images: `onError={(e) => { e.target.src = 'https://cards.scryfall.io/back.jpg' }}`. Some tokens and promos have no `image_uris`.

---

## Example User Flows

### Flow 1 — New visitor discovers the app
1. Lands on homepage → sees hero section + features
2. Scrolls to Trending Decks → browses Modern meta
3. Clicks "View Deck" on a Burn deck → sees card list in modal
4. Clicks "Ready to Brew?" CTA → signup modal opens
5. Creates account → redirected to `/builder`
6. Starts building with AI assistance

### Flow 2 — Logged-in user builds a Modern deck
1. Navigates to `/builder` → authenticated, builder loads
2. Selects **Modern** format → AI is now locked to Modern-legal cards only
3. Types: _"I want to build a red aggro burn deck"_
4. AI responds with strategy overview + pushes red aggro cards to results grid
5. User hovers Goblin Guide to read it (hover enlarges card), clicks it
6. Modal opens → AI suggests quantity 4 → user confirms → added to deck
7. Searches manually for "Mountain" in the card search bar, adds 20
8. Deck panel shows 60/60 — header badge turns green
9. User hits **Save** → deck saved to profile
10. User exports as MTGO text format

### Flow 3 — User hits AI message limit
1. Free user has sent 20 messages today
2. Types a new message → frontend shows limit warning before sending
3. Backend returns 429 → `ChatLimitBanner` appears: _"Daily limit reached. Resets at midnight UTC."_
4. Input is disabled — user sees upgrade prompt for premium
5. User can still manually search cards and edit their deck

### Flow 4 — User imports a meta deck
1. User clicks **"Import Meta Deck"** in builder header
2. `MetaImportModal` opens, format pre-set to Modern
3. User sees list of current top Modern decks from MTGTop8
4. Clicks "Import" on a Living End deck
5. Confirm dialog: _"This will replace your current deck. Continue?"_
6. Deck is imported, all cards validated against Modern legality
7. Deck appears in the deck list panel, ready to customize

### Flow 5 — User tracks win rate
1. User navigates to `/profile/username` → sees their deck library
2. Clicks "View Details" on their Burn deck → `DeckDetailPage`
3. Scrolls to match log → clicks **"Log Match"**
4. Selects Win, types opponent archetype "Tron", adds note
5. Match is saved → win rate updates to `13W – 7L = 65% WR`
6. Win rate chart shows upward trend over last 30 days
