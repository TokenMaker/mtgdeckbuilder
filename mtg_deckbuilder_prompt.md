# MTG AI Deck Builder — Full Build Specification

> **Target:** Claude Code / Cursor / Google Project IDX / Replit  
> **Version:** 1.0.0  
> **Description:** A full-stack AI-powered Magic: The Gathering deck building web app. Users collaborate with an AI assistant to build, analyze, and save MTG decks using real card data from the Scryfall API.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS | React Router v6, Lucide React icons, Recharts for mana curve |
| State | React useState + useContext | No Redux needed |
| Backend | Node.js 20+ / Express.js | API proxy for Claude (keeps key server-side), auth middleware, deck CRUD |
| Database | Supabase | PostgreSQL + Auth (email & Google OAuth) + Row Level Security |
| Card Data | Scryfall API | Free, no key required — `https://api.scryfall.com` |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) | `ANTHROPIC_API_KEY` env var — never expose client-side |
| Hosting | Vercel (frontend) + Railway or Render (backend) | |

### Scryfall Key Endpoints
- `GET /cards/search?q={query}` — main search
- `GET /cards/named?fuzzy={name}` — fuzzy card name lookup
- `GET /cards/{id}` — fetch single card by Scryfall ID

> ⚠️ Respect Scryfall rate limits: max 10 req/sec. Add 50–100ms delay between sequential calls. Cache results (LRU, 5 min TTL).

---

## Project Structure

```
mtg-deck-builder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx              # Format selector, deck name, save/export buttons
│   │   │   │   └── ThreePanelLayout.jsx    # Main layout container
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx           # Conversation UI
│   │   │   │   ├── ChatMessage.jsx         # Individual message bubble
│   │   │   │   └── ChatInput.jsx           # Text input + send button
│   │   │   ├── cards/
│   │   │   │   ├── CardGrid.jsx            # Results grid with thumbnails
│   │   │   │   ├── CardThumbnail.jsx       # Individual card with hover enlarge
│   │   │   │   ├── CardDetailModal.jsx     # Add to deck popup
│   │   │   │   └── CardImage.jsx           # Handles double-faced cards
│   │   │   ├── deck/
│   │   │   │   ├── DeckPanel.jsx           # Right panel deck list
│   │   │   │   ├── DeckGroup.jsx           # Section: Creatures (12), etc.
│   │   │   │   ├── DeckCardRow.jsx         # "4x Lightning Bolt [remove]"
│   │   │   │   ├── DeckStats.jsx           # Card count, color pips, warnings
│   │   │   │   ├── ManaCurveChart.jsx      # Bar chart by CMC (Recharts)
│   │   │   │   └── SideboardSection.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginModal.jsx
│   │   │   │   ├── SignupModal.jsx
│   │   │   │   └── AuthProvider.jsx        # Supabase auth context
│   │   │   └── decks/
│   │   │       ├── SavedDecksModal.jsx     # Load/delete saved decks
│   │   │       └── ExportModal.jsx         # MTGO/Arena text export
│   │   ├── hooks/
│   │   │   ├── useDeck.js                  # Deck state management
│   │   │   ├── useScryfall.js              # Scryfall API calls
│   │   │   ├── useChat.js                  # Chat + AI integration
│   │   │   └── useFormat.js                # Format rules + legality checks
│   │   ├── utils/
│   │   │   ├── formatRules.js              # Per-format deck rules
│   │   │   ├── deckExport.js               # Export formatting
│   │   │   └── cardGrouping.js             # Group cards by type
│   │   ├── context/
│   │   │   ├── DeckContext.jsx
│   │   │   └── FormatContext.jsx
│   │   ├── services/
│   │   │   ├── api.js                      # Backend API calls
│   │   │   └── supabase.js                 # Supabase client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── chat.js                         # POST /api/chat — Claude proxy
│   │   ├── decks.js                        # CRUD for saved decks
│   │   └── scryfall.js                     # Scryfall proxy with rate limiting
│   ├── middleware/
│   │   ├── auth.js                         # Verify Supabase JWT
│   │   └── rateLimit.js
│   ├── services/
│   │   ├── claudeService.js                # Anthropic SDK wrapper
│   │   └── scryfallService.js              # Scryfall fetch + caching
│   ├── server.js
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
└── README.md
```

---

## UI Layout

Dark theme throughout — evokes the MTG Arena / card back aesthetic.

### Header (fixed, full width)
| Position | Element |
|---|---|
| Left | App logo + "MTG AI Deck Builder" |
| Center-left | Format selector dropdown |
| Center | Editable deck name input |
| Center-right | Live card count badge — `58 / 60` (red = invalid, green = valid) |
| Right | Save Deck · My Decks · Export buttons |
| Far right | Login button / User avatar |

### Three-Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│         Header: Format | Deck Name | Count | Save | Export       │
├─────────────────┬───────────────────────┬───────────────────────┤
│   CHAT (30%)    │  CARD RESULTS (40%)   │   DECK LIST (30%)     │
│                 │                       │                        │
│ AI conversation │ Thumbnail grid        │ Grouped by type        │
│ User msgs right │ Hover = enlarge       │ Creatures (12)         │
│ AI msgs left    │ Click = add modal     │ Instants (8)           │
│                 │ Legality badges       │ Lands (24)             │
│ [Prompt chips]  │ Loading skeletons     │ --- Sideboard ---      │
│ [Text input]    │                       │ Mana curve chart       │
└─────────────────┴───────────────────────┴───────────────────────┘
```

#### Chat Panel
- Scrollable message history
- AI message can contain card name references as clickable chips
- Animated typing indicator while AI responds
- Suggested prompt chips for new users: "Show me cheap removal", "Find card draw spells", etc.
- Premium badge + upgrade prompt for collaborator features (free users)

#### Card Results Grid
- Responsive CSS grid, 3–4 columns
- Each thumbnail: Scryfall card image + card name below
- **Hover effect:** CSS-only `transform: scale(1.8)` with `z-index: 50` — enlarges toward viewport center, never clips. No JavaScript needed.
- Legality badge per card: ✅ legal · ❌ illegal · ⚠️ banned
- Click → opens Card Detail Modal
- Loading skeleton placeholders while fetching
- Empty state with prompt suggestions before first search
- Pagination or infinite scroll beyond 20 results

#### Deck List Panel
- Sections: Creatures · Instants · Sorceries · Enchantments · Artifacts · Planeswalkers · Lands
- Each row: `[qty badge] Card Name [mana symbols] [x]`
- Click card name → view card detail
- Inline `+` / `–` quantity buttons
- Sideboard section below main deck (60-card formats only)
- Mana curve bar chart (CMC 0–7+) using Recharts
- Color identity pips row
- Warning banners: illegal card · banned card · over 4 copies · deck size invalid
- Sticky total count footer

---

## Card Detail Modal

Triggered by clicking any card thumbnail.

| Element | Detail |
|---|---|
| Card image | Large, double-faced cards show face toggle button |
| Card info | Name, mana cost, type line, oracle text, P/T or loyalty |
| Legality badge | Colored badge for currently selected format |
| Quantity input | Default 1 · max 4 (or 1 for Commander · unlimited for basic lands) |
| AI Suggest Quantity | Button → calls backend with deck context → returns qty + reasoning in tooltip |
| Add to Main Deck | Primary button — **disabled if card is illegal** |
| Add to Sideboard | Secondary button — shown for 60-card formats only |
| Illegal warning | Red banner with reason if card fails legality check |
| Banned warning | Orange banner if card is banned in selected format |
| Close | Button or click outside |

---

## Format Rules Engine

All rules enforced in real time as cards are added. Use `card.legalities[format]` from Scryfall.

### Format Configurations

| Format | Min Size | Max Copies | Sideboard | Singleton | Special |
|---|---|---|---|---|---|
| Standard | 60 | 4 | 15 | No | — |
| Modern | 60 | 4 | 15 | No | — |
| Pioneer | 60 | 4 | 15 | No | — |
| Legacy | 60 | 4 | 15 | No | — |
| Vintage | 60 | 4 | 15 | No | Restricted list (max 1 copy) |
| Commander | 100 | 1 | No | Yes | Color identity, Commander slot |
| Pauper | 60 | 4 | 15 | No | Commons only |

### Validation Rules

**`illegal_card`** — Check `card.legalities[format] === "legal"`. If not, **block** add. Show red warning: _"This card is not legal in [Format]."_

**`banned_card`** — Check `card.legalities[format] === "banned"`. **Warn but allow** (casual play). Show persistent orange badge in deck list: _"[Card Name] is banned in [Format]."_

**`restricted_card`** — Vintage only. If `legalities.vintage === "restricted"`, enforce max 1 copy. Warn on second add attempt.

**`max_copies`** — Enforce per-format copy limit. Exceptions:
- Cards with basic land type (`card.type_line.includes("Basic Land")`) → unlimited
- Cards with "A deck can have any number of copies" in oracle text (e.g. Relentless Rats) → unlimited

**`deck_size`** — Live badge in header turns red when under minimum or over maximum. Block **save** (not add) when size is invalid.

**`commander_color_identity`** — Check `card.color_identity` array against commander's `color_identity`. Block if any color falls outside. Note: use `color_identity`, NOT `colors` — rules text symbols count.

**`commander_slot`** — Commander zone is separate from the 99. Must be a Legendary Creature, or have oracle text "can be your commander".

**`pauper_rarity`** — Check `card.rarity === "common"`. Block non-commons with: _"Only common cards are allowed in Pauper."_

---

## AI Chat System

### Tiers

**Free tier** — Smart search assistant:
- Interpret natural language → Scryfall query
- Explain card effects in plain English
- Answer MTG rules questions
- Suggest quantity when user clicks "AI Suggest Quantity"

**Premium tier** — Full collaborator (all free features plus):
- Proactive deck analysis after each card add: _"You only have 18 lands — Modern aggro typically runs 20–22"_
- Identify deck archetype, suggest missing pieces
- Warn about synergy conflicts
- Suggest upgrades or budget alternatives
- Full deck review on request

### Backend Chat Endpoint

`POST /api/chat`

**Request:**
```json
{
  "message": "user's message",
  "conversationHistory": [{ "role": "user|assistant", "content": "..." }],
  "currentDeck": {
    "mainboard": [...cards],
    "sideboard": [...cards],
    "format": "modern",
    "commander": null
  },
  "selectedFormat": "modern",
  "isPremium": false
}
```

**Response:**
```json
{
  "message": "AI text response for chat display",
  "scryfallQuery": "lightning bolt format:modern",
  "cards": [...scryfallCardObjects],
  "suggestedQuantity": null,
  "suggestedQuantityReasoning": null,
  "action": "search | analyze | answer | suggest_quantity"
}
```

### AI System Prompt

```
You are an expert Magic: The Gathering deck building assistant.
Your role is to help users find cards, understand the game, and build great decks.

ALWAYS respond in valid JSON with this exact structure:
{
  "message": "Your conversational response — explain what you found or answer their question",
  "scryfallQuery": "a valid scryfall search query string, or null if no card search needed",
  "action": "search | analyze | answer | suggest_quantity",
  "suggestedQuantity": null or a number,
  "suggestedQuantityReasoning": null or a short explanation string
}

Scryfall query syntax:
- Format:      format:modern / format:standard
- Color:       c:r (red)  c:ub (blue+black)  c:colorless
- Type:        t:creature  t:instant  t:land
- CMC:         cmc<=2  cmc=3
- Power/tough: pow>=4  tou>=4
- Rarity:      r:rare  r:common
- Oracle text: o:"draw a card"  o:"destroy target"
- Combined:    t:creature cmc<=2 format:modern c:r

Current format: {{FORMAT}}
Current deck: {{DECK_SUMMARY}}
User tier: {{TIER}}

For premium users: proactively analyze the deck after each card is added.
For free users: focus on the specific question asked.
Never expose raw Scryfall syntax to the user unless they ask.
Always be encouraging — MTG can be complex for newer players.
```

### Chat → Grid Flow

1. User types message in chat panel
2. Frontend POSTs to `/api/chat` with message + full deck context
3. Backend injects system prompt (format, deck, tier) and calls Claude
4. Claude returns JSON with `message` + `scryfallQuery`
5. If `scryfallQuery` present: backend calls Scryfall, appends `cards` array
6. Frontend displays AI message in chat, pushes cards to grid panel
7. User browses grid, clicks card, adds to deck

---

## Database Schema

```sql
-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) PRIMARY KEY,
  username      TEXT UNIQUE,
  is_premium    BOOLEAN DEFAULT false,
  deck_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Decks
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
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- mainboard/sideboard card object shape:
-- {
--   "id": "scryfall_id",
--   "name": "Card Name",
--   "quantity": 4,
--   "mana_cost": "{1}{R}",
--   "type_line": "Instant",
--   "cmc": 2,
--   "image_uris": { "normal": "...", "large": "..." },
--   "legalities": { "modern": "legal", ... },
--   "color_identity": ["R"]
-- }

-- Row Level Security
ALTER TABLE decks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own decks only"    ON decks    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own profile only"  ON profiles FOR ALL USING (auth.uid() = id);
```

> Use a Supabase auth trigger or webhook to auto-create a `profiles` row on first sign-up.

---

## Backend API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | Optional | Claude proxy. Premium features gated behind JWT + `is_premium`. |
| GET | `/api/decks` | Required | All decks for authenticated user |
| POST | `/api/decks` | Required | Save new deck. Enforce 10-deck limit for free users. |
| PUT | `/api/decks/:id` | Required | Update existing deck (must own) |
| DELETE | `/api/decks/:id` | Required | Delete deck (must own) |
| GET | `/api/scryfall/search` | None | Proxied Scryfall search with rate limiting + cache |

---

## Authentication

- **Provider:** Supabase Auth
- **Methods:** Email + password, Google OAuth

| Feature | Auth Required |
|---|---|
| Card search + deck building | ❌ No — fully public |
| Save deck | ✅ Yes — clicking save while logged out opens login modal |
| My Decks | ✅ Yes |
| Premium AI features | ✅ Yes + `is_premium = true` on profile |

---

## Export Format

Standard MTGO / MTG Arena text format (universally accepted by deck tools):

```
4 Lightning Bolt
4 Goblin Guide
4 Monastery Swiftspear
20 Mountain

Sideboard
2 Grafdigger's Cage
3 Smash to Smithereens
```

- Copy to clipboard button
- Download as `.txt` — filename: `[deck-name]-[format].txt`
- Commander: list commander first under a `Commander` header

---

## Environment Variables

**Backend `.env`**
```
ANTHROPIC_API_KEY=           # Never expose to frontend
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # Server-side only — full DB access
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=      # Safe for frontend — public key
VITE_API_BASE_URL=http://localhost:3001
```

---

## Build Order

Work through these phases in sequence. Complete and test each phase before moving to the next.

### Phase 1 — Foundation
- [ ] Scaffold Vite + React frontend and Express backend
- [ ] Install all dependencies, configure Tailwind dark theme
- [ ] Build `ThreePanelLayout` and `Header` with format selector
- [ ] Set up Supabase project and run migrations
- [ ] Configure all environment variables

### Phase 2 — Card Search Core
- [ ] Build `scryfallService.js` (search, fetch, rate limiting, cache)
- [ ] Build `CardGrid` with thumbnail rendering
- [ ] Implement CSS-only hover enlarge effect
- [ ] Build `CardDetailModal` with add-to-deck flow
- [ ] Test with hardcoded Scryfall queries

### Phase 3 — Deck Building
- [ ] Build `useDeck` hook with full state management
- [ ] Build `DeckPanel` with grouped card sections
- [ ] Implement real-time card count and inline quantity editing
- [ ] Build mana curve chart with Recharts
- [ ] Add color identity pip display

### Phase 4 — Format Enforcement
- [ ] Build `formatRules.js` with all 7 format configs
- [ ] Implement legality checking on every card add
- [ ] Warning banners: illegal · banned · restricted
- [ ] Commander-specific rules (singleton, color identity, commander slot)
- [ ] Pauper rarity check
- [ ] Live deck size validation in header badge

### Phase 5 — AI Chat
- [ ] Build `claudeService.js` on backend
- [ ] Build `/api/chat` route with system prompt injection
- [ ] Build `ChatPanel`, `ChatMessage`, `ChatInput`
- [ ] Wire AI response → cards push to grid panel
- [ ] Typing indicator + error handling
- [ ] Suggested prompt chips for new users

### Phase 6 — Auth & Saving
- [ ] Build `AuthProvider` with Supabase session
- [ ] Build Login and Signup modals
- [ ] Build `/api/decks` CRUD routes
- [ ] Build `SavedDecksModal`
- [ ] Wire Save button in header
- [ ] Enforce 10-deck free tier limit

### Phase 7 — Export
- [ ] Build `deckExport.js` utility
- [ ] Build `ExportModal` with copy + download
- [ ] Handle Commander export format

### Phase 8 — Premium Features
- [ ] Add `isPremium` flag to auth context
- [ ] Gate proactive deck analysis in AI system prompt
- [ ] Upgrade prompt UI in chat panel for free users
- [ ] "AI Suggest Quantity" in card detail modal

### Phase 9 — Polish
- [ ] Loading skeletons for card grid
- [ ] Error and empty states
- [ ] Responsive layout (tablet minimum)
- [ ] Keyboard accessibility (Escape closes modals, Enter sends chat)
- [ ] Toast notifications (saved · added · errors)
- [ ] Debounce Scryfall calls, memoize card components

---

## Design Guidelines

**Theme:** Dark — evokes MTG Arena and card back aesthetic.

| Token | Value |
|---|---|
| Background | `bg-gray-950` / `bg-zinc-950` |
| Panel | `bg-gray-900` |
| Border | `border-gray-700` |
| Accent | `amber-400` / `amber-500` (gold card frame feel) |
| Legal | `green-400` |
| Illegal | `red-400` |
| Banned | `orange-400` |
| User message | `bg-amber-600` |
| AI message | `bg-gray-700` |

**Mana colors:**
| Symbol | Color | Tailwind |
|---|---|---|
| W | White | `bg-yellow-50` |
| U | Blue | `bg-blue-600` |
| B | Black | `bg-gray-900` |
| R | Red | `bg-red-600` |
| G | Green | `bg-green-700` |
| C | Colorless | `bg-gray-400` |

**Typography:** Inter or system-ui for UI. Google Font `Cinzel` as a Beleren substitute for deck name / headings.

**Card images:**
- Grid thumbnails → `image_uris.normal`
- Modal → `image_uris.large`
- Double-faced cards → `card_faces[0].image_uris` by default, flip button to toggle
- Fallback (missing image) → `https://cards.scryfall.io/back.jpg`

---

## Critical Implementation Notes

> These are common failure points — read before coding each section.

**Scryfall rate limiting** — Max 10 req/sec. Add 100ms delay between sequential backend calls. Use an in-memory LRU cache with 5-minute TTL to avoid duplicate fetches.

**Card hover z-index** — Use CSS only (`transform: scale(1.8)`, `z-index: 50`, `position: absolute`). Set `transform-origin` so the enlarged card stays within the viewport and never clips behind panel edges.

**Commander color identity** — Always use `card.color_identity` (not `card.colors`). Color identity includes color symbols in rules text, not just the mana cost. A colorless-cost card with a green activated ability still has `color_identity: ["G"]`.

**Basic lands** — Always unlimited copies regardless of format. Detect with `card.type_line.includes("Basic Land")`. Includes snow-covered variants.

**Claude JSON parsing** — Always wrap `JSON.parse` in `try/catch`. If parsing fails, fall back to treating the full response text as the `message` field with `scryfallQuery: null`.

**Supabase RLS** — Enable Row Level Security on every table. Never use the service role key client-side — it bypasses RLS entirely. Service role key = backend only.

**Deck state persistence** — Persist the in-progress deck to `localStorage` so users don't lose work on refresh. Clear it after a successful save to Supabase.

**Image error handling** — Some cards (tokens, promos) lack `image_uris`. Always render with an `onError` fallback to the official card back image.

---

## Example User Flows

### Flow 1 — New user builds a Modern aggro deck
1. User opens app, selects **Modern** from format dropdown
2. Types: _"I want to build a red aggro deck, show me good 1-drop creatures"_
3. AI responds in chat with explanation; cards appear in grid
4. User hovers Goblin Guide to read it, clicks it
5. Modal opens → sets quantity to 4 → "Add to Main Deck"
6. Card appears in deck list under **Creatures (4)**
7. User continues: _"Now show me burn spells under 2 mana"_
8. Repeat until deck is complete
9. Clicks **Save** → login modal appears → user signs up
10. Deck saved → user exports in MTGO format

### Flow 2 — User tries to add an illegal card
1. User has **Standard** selected
2. Finds Lightning Bolt (not in Standard) in results
3. Clicks card → modal shows red banner: _"Lightning Bolt is not legal in Standard"_
4. "Add to Main Deck" button is **disabled**
5. AI suggests: _"Lightning Bolt isn't in Standard, but Lightning Strike is a similar option!"_

### Flow 3 — Commander deck building
1. User selects **Commander** format
2. Types: _"I want to build an Atraxa commander deck"_
3. AI explains Atraxa, fetches the card, confirms adding as commander
4. Atraxa placed in Commander zone — 4-color identity locked (W/U/B/G)
5. All searches auto-filter to WUBG color identity
6. Attempting to add a red card → blocked with color identity warning
7. Deck counter shows progress toward 99 cards + 1 commander
