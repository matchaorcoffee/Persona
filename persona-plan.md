# Persona — Full-Stack AI Companion Chatbot — Implementation Plan

## Overview

Build **Persona**, a full-stack AI companion web application where users select AI characters, hold evolving conversations, and build persistent relationships over time. Each character has a distinct personality, emotional state, and memory — all stored per user-character pair in a PostgreSQL database via Prisma. The frontend is React; the backend is Node.js + Express. OpenAI (GPT-4o) is the default AI provider, fully swappable through environment variables.

### Key Design Principles
- No two characters respond the same way — personality is injected at the prompt construction layer.
- Relationship progression is **context-driven** (not message-count-driven).
- Memory is **selective** — the system extracts important facts from conversations rather than storing every message.
- The AI provider is **abstracted** behind an `AIService` interface so it can be replaced without touching business logic.
- User-created characters are optionally shareable to a public gallery.
- Auth is **email + password with JWT** (access token + refresh token).
- Characters are clearly identified as AI at the UI level per the safety requirements.

---

## Architecture Diagram (Text)

```
[React SPA]
    |
    | REST API (JWT-authenticated)
    v
[Express API Server]
    |--- AuthController       → login / register / refresh
    |--- CharacterController  → CRUD characters, gallery
    |--- ConversationController → new conv, load history
    |--- MessageController    → send message, receive AI reply
    |--- MemoryController     → read/update memories
    |--- RelationshipController → read relationship state
    |
    |--- AIService (interface)
    |       └── OpenAIProvider (default, env-configured)
    |
    |--- MemoryService       → extract + persist important memories
    |--- RelationshipService → score + update relationship state
    |--- EmotionService      → update character emotional state
    |
    v
[PostgreSQL via Prisma ORM]
    Tables: User, Character, Conversation, Message,
            Memory, Relationship, EmotionalState
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffolding & Monorepo Structure

**Status:** `[ ] pending`

**Intent:**
Create the project directory structure, initialize both frontend (React + Vite) and backend (Node/Express/TypeScript) packages, install core dependencies, and wire up shared configuration (env, tsconfig, eslint).

**Expected Outcomes:**
- `client/` — React + Vite app bootstrapped with TypeScript
- `server/` — Express app bootstrapped with TypeScript
- `.env.example` at root with all required environment variable keys
- `package.json` at root for workspaces or task scripts
- Both `client` and `server` can be started independently

**Todo List:**
1. Create root `package.json` with npm workspaces pointing at `client/` and `server/`
2. Scaffold `client/` with Vite + React + TypeScript template
3. Scaffold `server/` with `tsconfig.json`, `src/` layout, `ts-node-dev` for dev server
4. Install client deps: `react-router-dom`, `axios`, `zustand`, `tailwindcss`, `framer-motion`, `lucide-react`, `@radix-ui/react-*` (dialog, tooltip, avatar), `clsx`, `tailwind-merge`
5. Install server deps: `express`, `prisma`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `zod`, `cors`, `helmet`, `morgan`, `dotenv`, `openai`
6. Install server dev deps: `typescript`, `ts-node-dev`, `@types/*`
7. Create `.env.example` with keys: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `PORT`, `CLIENT_URL`
8. Set up Tailwind config for `client/`
9. Create `server/src/` folder structure: `controllers/`, `services/`, `routes/`, `middleware/`, `prisma/`, `utils/`, `types/`
10. Create `client/src/` folder structure: `pages/`, `components/`, `hooks/`, `stores/`, `services/`, `types/`, `utils/`

**Relevant Context:**
- No existing files — full greenfield.
- Use Vite for fast React dev experience.
- Use TypeScript throughout for type safety.

---

### Sub-Task 2 — Database Schema (Prisma)

**Status:** `[ ] pending`

**Intent:**
Define the complete Prisma schema covering all entities: User, Character, Conversation, Message, Memory, Relationship, EmotionalState. Implement the initial migration and seed data for 4 pre-built characters.

**Expected Outcomes:**
- `server/prisma/schema.prisma` fully defined
- Migration applied and database ready
- Seed file inserts 4 pre-built characters with full personality JSON
- All relations correctly defined with cascade rules

**Todo List:**
1. Initialize Prisma in `server/`: `npx prisma init`
2. Write `schema.prisma`:
   - `User`: id, email, passwordHash, createdAt, updatedAt
   - `Character`: id, name, avatarUrl, tagline, description, personalityJson (stores full personality object), isSystemCharacter (bool), isPublic (bool), createdByUserId (nullable FK to User), createdAt
   - `Conversation`: id, userId (FK), characterId (FK), title, createdAt, updatedAt
   - `Message`: id, conversationId (FK), role (USER/ASSISTANT), content, createdAt
   - `Memory`: id, userId (FK), characterId (FK), type (FACT/EVENT/PREFERENCE/MILESTONE), content, importance (Int 1-10), createdAt
   - `Relationship`: id, userId (FK), characterId (FK), stage (STRANGER/ACQUAINTANCE/FRIEND/CLOSE_FRIEND/ROMANTIC_INTEREST/DEEP_CONNECTION), familiarity (Float), trust (Float), friendship (Float), affection (Float), curiosity (Float), emotionalCloseness (Float), updatedAt — unique on (userId, characterId)
   - `EmotionalState`: id, userId (FK), characterId (FK), currentEmotion (String), intensity (Float 0-1), updatedAt — unique on (userId, characterId)
3. Add proper indexes (userId+characterId pairs)
4. Run `prisma migrate dev --name init`
5. Write `server/prisma/seed.ts` with 4 characters:
   - **Alex** — INTJ, reserved, sarcastic, protective, intellectual
   - **Mika** — ENFP, bubbly, enthusiastic, creative, easily excited
   - **Rael** — INFP, gentle, poetic, melancholic, deeply empathetic
   - **Zara** — ESTP, bold, competitive, blunt, adventurous
6. Each character seed includes full `personalityJson`: type, communicationStyle, humorLevel, emotionalOpenness, confidence, interests, likes, dislikes, values, quirks, backstory, responseGuidelines
7. Add `"prisma": {"seed": "ts-node prisma/seed.ts"}` to server `package.json`
8. Run `prisma db seed`

**Relevant Context:**
- `personalityJson` stores the full character definition as a JSON column — this gets passed to the AI prompt builder.
- `Relationship` and `EmotionalState` are user-character specific (unique constraint on userId+characterId).
- System characters have `isSystemCharacter: true` and `createdByUserId: null`.

---

### Sub-Task 3 — Auth System (Backend)

**Status:** `[ ] pending`

**Intent:**
Implement email + password authentication with JWT access tokens (short-lived) and refresh tokens (stored in DB or httpOnly cookie). Includes register, login, refresh, and logout endpoints.

**Expected Outcomes:**
- `POST /api/auth/register` — creates user, returns tokens
- `POST /api/auth/login` — validates credentials, returns tokens
- `POST /api/auth/refresh` — issues new access token from refresh token
- `POST /api/auth/logout` — invalidates refresh token
- `authenticateJWT` middleware protecting all other routes

**Todo List:**
1. Create `server/src/middleware/auth.middleware.ts` — validates Bearer token, attaches `req.user`
2. Create `server/src/controllers/auth.controller.ts` with register/login/refresh/logout handlers
3. Create `server/src/routes/auth.routes.ts`
4. Use `bcryptjs` for password hashing (salt rounds: 12)
5. Access token: 15-minute expiry, signed with `JWT_SECRET`
6. Refresh token: 7-day expiry, signed with `JWT_REFRESH_SECRET`, stored as httpOnly cookie
7. Input validation with `zod` schemas
8. Register route: check email uniqueness, hash password, create User record, seed default Relationship + EmotionalState records for all system characters
9. Wire routes into `server/src/app.ts`

**Relevant Context:**
- Refresh token as httpOnly cookie avoids XSS token theft.
- Auto-seeding relationship/emotion records on registration means the relationship system always has a row to update.

---

### Sub-Task 4 — Character & Relationship API (Backend)

**Status:** `[ ] pending`

**Intent:**
Build the REST endpoints for listing characters, reading a character profile (with the user's specific relationship/emotion state), and the user-created character CRUD including the public gallery.

**Expected Outcomes:**
- `GET /api/characters` — returns all system + user's own + public user-created characters
- `GET /api/characters/:id` — returns character + user's relationship + emotion state
- `POST /api/characters` — create a custom character (auth required)
- `PATCH /api/characters/:id` — edit own character
- `DELETE /api/characters/:id` — delete own character
- `PATCH /api/characters/:id/publish` — toggle isPublic
- `GET /api/characters/gallery` — public user-created characters

**Todo List:**
1. Create `server/src/controllers/character.controller.ts`
2. Create `server/src/routes/character.routes.ts`
3. `GET /api/characters`: query all `isSystemCharacter=true` + `createdByUserId=req.user.id` + `isPublic=true` characters; join with Relationship and EmotionalState for the requesting user
4. `GET /api/characters/:id`: return character with personalityJson, current relationship row, current emotional state, and top-5 memories
5. `POST /api/characters`: validate input with zod (name, avatarUrl, tagline, description, personalityJson fields), create Character record, seed Relationship + EmotionalState for creating user
6. `PATCH /api/characters/:id`: only owner can edit non-system characters
7. `DELETE /api/characters/:id`: only owner, only non-system
8. `PATCH /api/characters/:id/publish`: toggle isPublic on own character; when someone from gallery adds it, create their own Relationship + EmotionalState seed
9. `GET /api/characters/gallery`: return all `isPublic=true, isSystemCharacter=false` characters with creator info

**Relevant Context:**
- `personalityJson` is never exposed as "AI instructions" label in the API response — it's returned as structured character data for display.
- System characters cannot be deleted or edited by users.

---

### Sub-Task 5 — Conversation & Message API (Backend)

**Status:** `[ ] pending`

**Intent:**
Build the conversation management endpoints (create, list, load history) and the core message endpoint that triggers AI generation, memory extraction, relationship scoring, and emotion updates.

**Expected Outcomes:**
- `POST /api/conversations` — create a new conversation with a character
- `GET /api/conversations` — list user's conversations (optionally filtered by character)
- `GET /api/conversations/:id/messages` — load paginated message history
- `POST /api/conversations/:id/messages` — send a message, receive AI reply with typing simulation

**Todo List:**
1. Create `server/src/controllers/conversation.controller.ts`
2. Create `server/src/routes/conversation.routes.ts`
3. `POST /api/conversations`: create Conversation record, return id
4. `GET /api/conversations`: list user's conversations joined with character name/avatar, last message preview, updatedAt
5. `GET /api/conversations/:id/messages`: paginated (cursor-based, 30 per page), validate conversation belongs to user
6. `POST /api/conversations/:id/messages`:
   a. Save user message to DB
   b. Load last 20 messages as recent context
   c. Load user's Relationship row for this character
   d. Load user's EmotionalState row for this character
   e. Load top-8 relevant Memories
   f. Load character's personalityJson
   g. Call `PromptBuilder.build()` to assemble the full system prompt
   h. Call `AIService.chat()` with the assembled context + conversation history
   i. Save assistant reply to DB
   j. Call `MemoryService.extract()` — analyze exchange for important facts/events
   k. Call `RelationshipService.update()` — score conversation impact on relationship values
   l. Call `EmotionService.update()` — recalculate character emotional state
   m. Return assistant message + updated relationship + emotion summary
7. Wire routes into `server/src/app.ts`

**Relevant Context:**
- Steps j, k, l (memory/relationship/emotion updates) are called as fire-and-forget after the reply is returned OR awaited — design for async but non-blocking from the user's perspective.
- The `POST /messages` endpoint is the most complex in the system — it orchestrates all services.

---

### Sub-Task 6 — AI Service Layer

**Status:** `[ ] pending`

**Intent:**
Build the abstracted AI provider interface, the OpenAI implementation, and the PromptBuilder that constructs the full character-aware system prompt from all context components.

**Expected Outcomes:**
- `server/src/services/ai/AIService.interface.ts` — `chat(messages, systemPrompt): Promise<string>`
- `server/src/services/ai/OpenAIProvider.ts` — calls OpenAI Chat Completions API
- `server/src/services/ai/index.ts` — exports active provider based on `AI_PROVIDER` env var
- `server/src/services/ai/PromptBuilder.ts` — assembles full system prompt from all 7 context layers

**Todo List:**
1. Create `AIService` interface: `chat(systemPrompt: string, messages: {role, content}[]): Promise<string>`
2. Create `OpenAIProvider` implementing the interface; reads `OPENAI_API_KEY` and `AI_MODEL` (default `gpt-4o`) from env; uses `openai` npm package
3. Create `ai/index.ts` factory — switches on `AI_PROVIDER` env var; default to `openai`
4. Create `PromptBuilder.ts` with static method `build({ character, relationship, emotionalState, memories, recentContext })` that assembles a structured system prompt with sections:
   - **Character Identity**: name, personality type, communication style, quirks
   - **Backstory**: character background, history
   - **Personality Guidelines**: how to speak, humor style, emotional expression level, response length tendencies
   - **Current Emotional State**: current emotion + intensity, and how it should color responses
   - **Relationship Context**: current stage, familiarity/trust/affection values, how to treat the user given this stage
   - **Memory Context**: relevant memories formatted as "Things I remember about [User]:"
   - **Safety Rules**: always stay in character; never claim to be conscious or truly sentient; never threaten abandonment; portray the character's personality authentically
5. Add a `system_test` script that calls the AI with a dummy prompt to verify the key works

**Relevant Context:**
- The prompt builder is the core of what makes each character feel different — personality guidelines must be specific enough that GPT-4o will actually behave differently (e.g. "Alex uses dry wit and rarely volunteers information; responses are short unless the topic is intellectual").
- `AI_PROVIDER` env var allows future providers (Anthropic, local LLM) to be dropped in.

---

### Sub-Task 7 — Memory Service

**Status:** `[ ] pending`

**Intent:**
Implement the selective memory extraction system that analyzes conversations and persists only meaningful facts, events, preferences, and milestones as Memory records.

**Expected Outcomes:**
- `server/src/services/memory.service.ts` with `extract(userId, characterId, userMessage, assistantReply)` method
- After each conversation exchange, important information is identified and saved as Memory records
- Duplicate or low-value memories are not stored
- Memories are retrievable by relevance for prompt injection

**Todo List:**
1. Create `MemoryService.extract()` — sends a short AI sub-call (GPT-4o-mini acceptable) with the user message + assistant reply asking: "Extract any important facts, preferences, events, or emotional milestones from this exchange. Return JSON array of {type, content, importance(1-10)} or empty array."
2. Filter out memories with importance < 4
3. For each extracted memory, check for near-duplicate in existing memories for this user-character pair (simple string similarity or embedding comparison if budget allows — default to string contains check for MVP)
4. Persist new unique memories as Memory records
5. Create `MemoryService.getRelevant(userId, characterId, limit)` — returns top N memories sorted by importance desc, createdAt desc
6. Create `MemoryService.getAll(userId, characterId)` — for profile page display (paginated)

**Relevant Context:**
- The memory extraction sub-call is intentionally lightweight — use a smaller model if cost is a concern (`gpt-4o-mini`).
- Memory types map to the DB enum: FACT / EVENT / PREFERENCE / MILESTONE.
- Memory importance score controls which memories get surfaced in prompts.

---

### Sub-Task 8 — Relationship & Emotion Services

**Status:** `[ ] pending`

**Intent:**
Implement the relationship scoring system (context-driven, not message-count-driven) and the emotional state simulation engine that updates per conversation exchange.

**Expected Outcomes:**
- `server/src/services/relationship.service.ts` with `update()` method
- `server/src/services/emotion.service.ts` with `update()` method
- Relationship values change gradually and meaningfully based on conversation content
- Emotional state influences the prompt and is itself updated after each exchange
- Relationship stage advances only when multiple dimension values cross thresholds

**Todo List:**
1. Create `RelationshipService.update(userId, characterId, userMessage, assistantReply, currentRelationship)`:
   - Use a short AI sub-call: "Given this exchange, how should the following relationship values change (scale -1 to +1): familiarity, trust, friendship, affection, curiosity, emotionalCloseness? Return JSON."
   - Apply changes with a small scaling factor (e.g. `value += delta * 0.05`) to prevent large jumps
   - Clamp all values to 0-100 range
   - Recalculate stage based on weighted sum of values against stage thresholds:
     - STRANGER: sum < 20
     - ACQUAINTANCE: sum 20-40
     - FRIEND: 40-60
     - CLOSE_FRIEND: 60-75
     - ROMANTIC_INTEREST: 75-88
     - DEEP_CONNECTION: 88+
   - Persist updated Relationship record
2. Create `EmotionService.update(userId, characterId, userMessage, assistantReply, characterPersonality, currentEmotion)`:
   - Use a short AI sub-call: "Given the character's personality and this exchange, what emotion should [CharacterName] be feeling now? Choose from: happy, excited, curious, sad, nervous, annoyed, jealous, affectionate, calm, lonely. Return JSON {emotion, intensity(0-1)}."
   - Persist updated EmotionalState record
3. Both services should be lightweight sub-calls (use `gpt-4o-mini` or equivalent)

**Relevant Context:**
- The scaling factor (0.05) ensures relationships evolve gradually — a single very positive exchange won't jump stages.
- The emotion update is per-user-character (two different users can make the same character feel different emotions).

---

### Sub-Task 9 — Auth & Core UI (Frontend)

**Status:** `[ ] pending`

**Intent:**
Build the React app shell: routing, auth context, login/register pages, and the axios client with JWT refresh interceptor.

**Expected Outcomes:**
- App has routes: `/login`, `/register`, `/characters`, `/characters/:id`, `/chat/:characterId`, `/create-character`
- Auth state managed in Zustand store (persisted to localStorage)
- Axios instance with request interceptor (attaches token) and response interceptor (refreshes on 401)
- Login and Register pages with forms, validation, error display
- Protected route wrapper redirecting unauthenticated users

**Todo List:**
1. Create `client/src/stores/auth.store.ts` — Zustand store with user, accessToken, setAuth, logout actions
2. Create `client/src/services/api.ts` — axios instance with base URL, request interceptor (Authorization header), response interceptor (401 → call refresh → retry)
3. Create `client/src/pages/LoginPage.tsx` and `RegisterPage.tsx` with forms, validation, and error handling
4. Create `client/src/components/ProtectedRoute.tsx`
5. Set up `react-router-dom` routes in `App.tsx`
6. Add dark/light mode toggle using Tailwind `dark:` classes + localStorage preference
7. Create `client/src/components/Layout/AppShell.tsx` — top nav with logo, user menu, theme toggle

**Relevant Context:**
- Store access token in memory (Zustand) not localStorage for security; refresh token is httpOnly cookie.
- The axios refresh interceptor must queue concurrent 401s and replay them after token refresh (standard pattern).

---

### Sub-Task 10 — Character Selection Page (Frontend)

**Status:** `[ ] pending`

**Intent:**
Build the visually rich character selection/home page showing all available characters as cards, with personality tags, relationship stage badges, and navigation to chat or profile.

**Expected Outcomes:**
- `/characters` route shows a grid of character cards
- Each card: large avatar, name, tagline, personality tags, relationship stage badge, "Chat" and "View Profile" buttons
- Smooth hover animations, gradient accents per character
- Loading skeleton while fetching
- Gallery tab for public user-created characters
- "Create Character" button

**Todo List:**
1. Create `client/src/pages/CharactersPage.tsx`
2. Create `client/src/components/Characters/CharacterCard.tsx` — card with avatar, gradient overlay, name, tagline, personality tag pills, relationship badge, action buttons
3. Create `client/src/hooks/useCharacters.ts` — fetches character list from API
4. Add tab navigation: "My Characters" | "Gallery" | "My Creations"
5. Add responsive grid (2 cols mobile, 3-4 cols desktop)
6. Add framer-motion card entrance animations (staggered)
7. Add character-specific gradient themes derived from personality (e.g. cold colors for Alex, warm for Mika)

**Relevant Context:**
- Each character card should feel visually distinct — use the personality data to drive color/tone.
- This is the first impression of the app — invest in the visual polish here.

---

### Sub-Task 11 — Character Profile Page (Frontend)

**Status:** `[ ] pending`

**Intent:**
Build the character profile page showing full character information, the user's relationship progress, important memories, and relationship stage visualization.

**Expected Outcomes:**
- `/characters/:id` shows character avatar, name, personality, interests, bio
- Relationship stage displayed as a progress track (Stranger → Deep Connection)
- Relationship dimension bars (familiarity, trust, affection, etc.)
- Memory list showing what the character "remembers" about the user
- "Start Chatting" CTA

**Todo List:**
1. Create `client/src/pages/CharacterProfilePage.tsx`
2. Create `client/src/components/Characters/RelationshipProgress.tsx` — stage track with current stage highlighted
3. Create `client/src/components/Characters/RelationshipDimensions.tsx` — bar chart of 6 dimension values
4. Create `client/src/components/Characters/MemoryList.tsx` — list of memories with type icon (fact/event/preference/milestone)
5. Create `client/src/hooks/useCharacterProfile.ts` — fetches character + relationship + memories
6. Add personality trait pills, interests list, bio section
7. Do NOT expose internal personality JSON or AI instructions — only show user-facing character description

**Relevant Context:**
- The profile page must not reveal the underlying AI system prompt or emotional calculation values — only the character's displayed personality and the user's relationship metrics.

---

### Sub-Task 12 — Chat Interface (Frontend)

**Status:** `[ ] pending`

**Intent:**
Build the full-featured chat interface — message bubbles, typing indicator, character presence header, conversation list sidebar, and real-time-feeling message exchange.

**Expected Outcomes:**
- `/chat/:characterId` loads or creates a conversation
- Sidebar: list of past conversations with the character, new conversation button
- Chat header: character avatar, name, current emotional state indicator, online status
- Message area: user/assistant bubble distinction, timestamps, smooth scroll to bottom
- Typing indicator (animated dots) while waiting for AI response
- Input area: textarea, send button, keyboard shortcut (Enter to send)
- Mobile-responsive: sidebar collapses to drawer

**Todo List:**
1. Create `client/src/pages/ChatPage.tsx`
2. Create `client/src/components/Chat/MessageBubble.tsx` — user vs assistant styling, timestamp
3. Create `client/src/components/Chat/TypingIndicator.tsx` — animated 3-dot bounce
4. Create `client/src/components/Chat/ChatHeader.tsx` — avatar, name, emotion badge, character switch button
5. Create `client/src/components/Chat/ConversationSidebar.tsx` — list of conversations, new conversation button
6. Create `client/src/components/Chat/MessageInput.tsx` — textarea with auto-grow, send button
7. Create `client/src/hooks/useChat.ts` — manages conversation state, sends messages, handles loading/error states
8. After receiving AI reply, update relationship stage badge if it changed
9. Auto-scroll to bottom on new message with smooth behavior
10. Add framer-motion slide-in animation for new messages

**Relevant Context:**
- The typing indicator is cosmetic but important for the "alive" feeling — show it immediately on send, hide it when reply arrives.
- The chat should feel like a modern messaging app (think iMessage/WhatsApp aesthetic), not a chatbot widget.

---

### Sub-Task 13 — Create Character Page (Frontend)

**Status:** `[ ] pending`

**Intent:**
Build the "Create Your Own Character" multi-step form that lets users define a custom AI character and optionally publish it to the gallery.

**Expected Outcomes:**
- `/create-character` route with multi-step form
- Step 1: Basic Info (name, avatarUrl, tagline, description)
- Step 2: Personality (type, traits, communication style, humor, emotional openness, confidence)
- Step 3: Details (interests, likes, dislikes, values, quirks)
- Step 4: Story (backstory, relationship preferences)
- Step 5: Review + Publish toggle
- Form validation with helpful error messages
- On submit, character appears in user's "My Creations" tab

**Todo List:**
1. Create `client/src/pages/CreateCharacterPage.tsx`
2. Create `client/src/components/CreateCharacter/StepIndicator.tsx`
3. Create individual step form components: `BasicInfoStep`, `PersonalityStep`, `DetailsStep`, `StoryStep`, `ReviewStep`
4. Use local form state (useState or react-hook-form) with step navigation
5. Avatar URL input with preview image display
6. Multi-select tag input for traits, interests, etc.
7. On completion, POST to `/api/characters`, redirect to new character's profile page
8. Add "Publish to Gallery" toggle on the review step

**Relevant Context:**
- The form data directly maps to `personalityJson` in the DB — structure it exactly as the backend expects.

---

### Sub-Task 14 — Final Integration, Polish & Safety Layer

**Status:** `[ ] pending`

**Intent:**
Wire everything together, apply final UI polish, add the AI transparency disclaimer, test all major flows end-to-end, and ensure the safety requirements are met.

**Expected Outcomes:**
- Landing page at `/` redirects to `/characters` if logged in, or shows a marketing splash with login/register CTAs
- "This is an AI character" disclaimer visible on character cards and chat header
- All error states handled gracefully (API errors, AI failures, network errors)
- Dark/light mode works across all pages
- Mobile layout verified on all main pages
- Environment variable documentation complete in README
- No AI response claims the character is conscious or truly sentient

**Todo List:**
1. Create `client/src/pages/LandingPage.tsx` — hero with tagline, feature highlights, login/register CTAs
2. Add "AI Character" badge to CharacterCard and ChatHeader components
3. Add global error boundary and toast notification system (use `sonner` or similar)
4. Verify relationship stage updates are reflected in the UI after each message
5. Verify memory list updates on the profile page after conversations
6. Add README.md with: setup instructions, environment variables guide, how to swap AI providers, how to add new seed characters
7. Add rate limiting middleware to the Express app (`express-rate-limit`) on the message endpoint
8. Final review: ensure no endpoint returns `personalityJson` system prompt fields in a way that exposes AI instructions
9. Verify the 4 seed characters each have clearly distinct response styles by testing conversations

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_SECRET` | Access token signing secret | required |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | required |
| `OPENAI_API_KEY` | OpenAI API key | required |
| `AI_PROVIDER` | AI provider identifier | `openai` |
| `AI_MODEL` | Model name | `gpt-4o` |
| `PORT` | Express server port | `3001` |
| `CLIENT_URL` | React app URL for CORS | `http://localhost:5173` |

---

## Seed Character Profiles

| Name | Type | Style | Theme |
|---|---|---|---|
| Alex | INTJ | Reserved, dry sarcasm, protective | Dark blues, minimal |
| Mika | ENFP | Bubbly, enthusiastic, warm | Warm oranges/yellows |
| Rael | INFP | Gentle, poetic, introspective | Soft purples/muted greens |
| Zara | ESTP | Bold, blunt, competitive, direct | Energetic reds/oranges |
