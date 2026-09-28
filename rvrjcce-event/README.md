# RVRJCCE Inter-College Meet 2026 — Official University Event Platform

> **Institution:** R.V.R. & J.C. College of Engineering (RVRJCCE), Guntur, Andhra Pradesh  
> **Accreditation:** Autonomous • NAAC 'A+' Grade • NBA Accredited  
> **Theme:** *"Where Competition Meets Expression."*  
> **Event Categories:** Sports Championship & Literary & Cultural Meet

---

## 1. Executive Summary & Design Direction

This web platform is designed as an **editorial, light-theme, human-crafted university event microsite** built to institutional standards. It strictly avoids generic AI aesthetics, neon gradients, floating blobs, glassmorphism, or template-like repeated cards.

### Core Visual Principles
- **Light Theme Only:** Pristine white (`#FFFFFF`), canvas cream (`#FBFBFA`), and soft architectural stone (`#F5F3ED`).
- **Typography Pairing:**
  - Modern Sans UI & Meta: `Inter` / `Plus Jakarta Sans` / System UI stack
  - Refined Editorial Display: `Newsreader` / `Charter` / `Sitka Text` / `Georgia` for headlines and section statements
- **Restrained Institutional Palette:**
  - Institutional Accent: Collegiate Oxford Navy (`#0E223D`)
  - Cultural Accent: Warm Terracotta Ochre (`#9E472A`)
  - Subtle borders: `1px solid #E7E4DC` and `#C9C4B8`
- **Dynamic Placeholders:** Dynamic statistics (`XX+ Events`, `XX+ Participants`, `XX Days`, `XX Venues`) clearly indicated as dynamic database hooks without inventing unverifiable dates or prize amounts.

---

## 2. Event Architecture & Rules

The centralized event configuration is maintained in `config/eventConfig.js`:

### 01 — Sports Championship ("Compete with purpose.")
- **Boys Division:**
  - Basketball (Team: 5 + 5 substitutes, standard hardcourt arena, knockout)
  - Volleyball (Team: 6 + 6 substitutes, outdoor clay/synthetic, FIVB rules)
  - Table Tennis (Singles & Doubles, indoor complex, ITTF rules)
- **Girls Division:**
  - Throwball (Team: 7 + 5 substitutes, fast-paced court game)
  - Tennis (Singles & Doubles, championship courts, ITF rules)
  - Table Tennis (Singles & Doubles, indoor complex, ITTF rules)

### 02 — Literary & Cultural ("Expression takes many forms.")
Curated magazine layout with numbered categories (01 through 08):
- **01 — Fine Arts:** Spot painting, sketching & charcoal, clay modeling, poster art.
- **02 — Music & Band:** Solo (Vocals/Instrumental) & Group (Acoustic sets / Battle of the Bands).
- **03 — Dance:** Solo & Group (Classical Kuchipudi/Bharatanatyam, Folk, Freestyle, Hip-Hop).
- **04 — Choreoday:** Flagship Theme Based theatrical stage production.
- **05 — Dramatics:** One-act stage plays, street plays (Nukkad Natak), and dramatic monologues.
- **06 — Fashion Show:** Runway ensemble celebrating sustainable handlooms and campus styling.
- **07 — Tekraft Events:** Digital motion graphics, creative video reels, generative digital craft.
- **08 — Literary:** Parliamentary debate, extempore elocution, creative writing, and literary trivia.

---

## 3. Technology Stack & Component Structure

- **Frontend Core:** Lightweight, high-performance React component runtime conforming to standard React component and hooks specifications (`createElement`, `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `Fragment`, `render`).
- **Build System:** `esbuild` for instant, production-grade bundling of JSX/ESM assets.
- **Backend Server:** Node.js HTTP/REST API server (`server.js`) with Express-compatible routes.
- **Database & Persistence:** MongoDB schema specification (`models/Registration.js`) with complete Mongoose schema validation, indexes, and document persistence in `data/registrations.json`.

### Component Directory Layout
```
/rvrjcce-event/
├── config/
│   ├── eventConfig.js              # Centralized event definitions
│   └── imageAssets.js              # Visual identity & photography treatment configs
├── models/
│   └── Registration.js             # MongoDB Registration Schema & Model
├── src/
│   ├── index.html                  # HTML5 base document with typography & meta
│   ├── index.jsx                   # React entry point
│   ├── App.jsx                     # Route coordinator & section orchestrator
│   ├── api/
│   │   └── client.js               # REST API client
│   ├── core/
│   │   └── react.js                # React runtime & DOM reconciler
│   ├── styles/
│   │   └── main.css                # Light-theme editorial CSS design system
│   └── components/
│       ├── Navbar.jsx              # Sticky navigation, mobile drawer, action CTAs
│       ├── Hero.jsx                # Institutional eyebrow, editorial headline, collage
│       ├── IntroSection.jsx        # Institutional ethos, dynamic stats strip
│       ├── EventDiscovery.jsx      # 01 Sports vs 02 Cultural overview
│       ├── SportsSection.jsx       # Boys / Girls athletic cards, division filter
│       ├── LiteraryCulturalSection.jsx # Magazine layout (01-08), expandable rules
│       ├── FeaturedArena.jsx       # "Choose your arena" split conversion section
│       ├── RegistrationCTA.jsx     # High-conversion closing banner CTA
│       ├── RegistrationForm.jsx    # Validated registration form with dynamic dropdowns
│       ├── AdminDashboard.jsx      # University admin portal with metrics & controls
│       └── Footer.jsx              # Official institutional footer with copyright 2026
├── server.js                        # Node.js REST API & static server
├── build.js                        # esbuild bundle script
└── package.json
```

---

## 4. API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Aggregated statistics (total entries, sports, cultural, boys, girls, colleges) |
| `GET` | `/api/events` | Structured central event definitions |
| `GET` | `/api/registrations` | Query registrations with optional `category`, `division`, `event`, and `search` |
| `POST` | `/api/registrations` | Submit new participant registration with schema validation |
| `GET` | `/api/registrations/:id` | Retrieve single registration details |
| `DELETE` | `/api/registrations/:id` | Delete / archive a registration record |
| `GET` | `/api/export-csv` | Download complete or filtered registrations as CSV |

---

## 5. Verification & Testing

- Built and compiled clean ESM bundle via `esbuild`.
- Successfully validated in Google Chrome for Testing (headless shell):
  - 1440px Desktop viewport
  - 1280px Laptop viewport
  - 768px Tablet viewport
  - 390px Mobile viewport
- Verified live submissions, real-time metric counter updates, dynamic event dependent dropdowns, search/filter/sort in the Admin Portal, and CSV exports.
