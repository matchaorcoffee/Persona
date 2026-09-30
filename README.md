# Persona — AI Companion Chatbot

An interactive AI character platform where users can choose AI characters and build evolving relationships through conversations.

## Features

- **4 Pre-built Characters** — Alex (INTJ), Mika (ENFP), Rael (INFP), Zara (ESTP) — each with completely distinct personalities
- **Evolving Relationships** — Stranger → Acquaintance → Friend → Close Friend → Romantic Interest → Deep Connection
- **Persistent Memory** — Characters remember facts, events, preferences, and milestones from past conversations
- **Emotional States** — Each character maintains a simulated emotional state that influences their responses
- **Create Your Own** — Build custom characters with a multi-step form and optionally publish to the gallery
- **Dark/Light Mode** — Full theme support
- **JWT Authentication** — Secure email + password auth with refresh tokens

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + Radix UI + Framer Motion |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| AI | OpenAI GPT-4o (swappable) |
| Auth | JWT (access + refresh) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repo>
cd persona
npm install
```

### 2. Server Environment

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/persona_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
OPENAI_API_KEY="sk-your-openai-api-key"
AI_PROVIDER="openai"
AI_MODEL="gpt-4o"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 3. Database Setup

```bash
cd server

# Run migrations
npx prisma migrate dev --name init

# Seed the 4 pre-built characters
npm run prisma:seed
```

### 4. Start Development

From the project root:

```bash
npm run dev
```

This starts both the server (port 3001) and client (port 5173) concurrently.

Or start them independently:

```bash
# Server
cd server && npm run dev

# Client (in another terminal)
cd client && npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Access token signing secret (keep secret!) |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token signing secret (keep secret!) |
| `OPENAI_API_KEY` | ✅ | — | OpenAI API key |
| `AI_PROVIDER` | ❌ | `openai` | AI provider identifier |
| `AI_MODEL` | ❌ | `gpt-4o` | Model to use for chat completions |
| `PORT` | ❌ | `3001` | Express server port |
| `CLIENT_URL` | ❌ | `http://localhost:5173` | Frontend URL for CORS |

## Swapping AI Providers

The AI layer is fully abstracted. To add a new provider:

1. Create `server/src/services/ai/YourProvider.ts` implementing the `AIService` interface:

```typescript
export class YourProvider implements AIService {
  async chat(systemPrompt: string, messages: ChatMessage[]): Promise<string> { ... }
  async extractJSON<T>(prompt: string): Promise<T> { ... }
}
```

2. Register it in `server/src/services/ai/index.ts`:

```typescript
case 'your-provider':
  _aiService = new YourProvider();
  break;
```

3. Set `AI_PROVIDER=your-provider` in your `.env`

## Adding New Seed Characters

Add a new character object to the `systemCharacters` array in `server/prisma/seed.ts`, following the existing pattern, then re-run:

```bash
cd server && npm run prisma:seed
```

## Project Structure

```
persona/
├── client/               # React frontend
│   └── src/
│       ├── pages/        # Route-level pages
│       ├── components/   # Reusable UI components
│       ├── stores/       # Zustand state stores
│       ├── services/     # API client
│       ├── types/        # TypeScript types
│       └── utils/        # Helpers and constants
└── server/               # Express backend
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── routes/       # Express routers
    │   ├── services/     # Business logic (AI, Memory, Relationship, Emotion)
    │   │   └── ai/       # AI provider abstraction + PromptBuilder
    │   ├── middleware/   # Auth middleware
    │   ├── types/        # TypeScript types
    │   └── utils/        # Prisma client singleton
    └── prisma/           # Schema + migrations + seed
```

## Safety

- All characters are clearly labeled as **AI Characters** throughout the UI
- Characters may simulate emotions and attachment as part of the fictional interaction
- Characters will **never** claim to be truly conscious or sentient
- No manipulation mechanics: no threats of abandonment, no demands for money
- The application is built for connection, not dependency
