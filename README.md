# Arzi StarterKit - RAG Chatbot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

A production-ready AI chatbot with RAG (Retrieval-Augmented Generation) support, featuring document upload, configurable AI providers, and personalized conversations.

## 🚀 Features

- ✅ **Modern Stack** - Next.js 16, TypeScript 5, Tailwind CSS v4, Bun
- ✅ **RAG Pipeline** - Document upload, text extraction, chunking, vector embeddings
- ✅ **Multi-Provider AI** - OpenAI, Anthropic, Ollama with runtime switching
- ✅ **PostgreSQL + pgvector** - Vector storage for semantic search
- ✅ **Cloudflare R2** - Document file storage
- ✅ **Streaming Chat** - Real-time SSE streaming responses
- ✅ **Per-User Personalization** - Own documents, conversations, model preferences
- ✅ **Feature-Based Architecture** - Scalable and maintainable codebase
- ✅ **Authentication** - NextAuth v5 with credentials provider
- ✅ **RBAC System** - Role-based access control with permissions

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) with App Router |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Runtime** | [Bun](https://bun.sh/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) |
| **State Management** | [TanStack Query](https://tanstack.com/query) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector) |
| **ORM** | [Prisma v7](https://www.prisma.io/) |
| **AI Providers** | OpenAI GPT-4, Anthropic Claude 3, Ollama |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| **Authentication** | [NextAuth v5](https://authjs.dev/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library |
| **Deployment** | Docker + Docker Compose |

## 🏗️ Architecture

### RAG Pipeline Flow

```
User Upload → R2 Storage → Text Extraction → Chunking → Embedding → pgvector
                                    ↓
User Query → Embed Query → Vector Search → Context Injection → AI Response
```

### Feature Modules

```
src/
├── features/          # Feature-based organization
│   ├── auth/         # Authentication (login, signup)
│   ├── permissions/  # Permissions management
│   ├── dashboard/    # Dashboard & navigation
│   ├── users/        # User management
│   ├── roles/        # Role management
│   ├── settings/     # Settings (AI preferences)
│   └── chat/         # Chat feature (NEW)
├── lib/
│   ├── ai/          # AI providers & RAG pipeline (NEW)
│   │   ├── types.ts           # Provider interface
│   │   ├── openai-provider.ts # OpenAI adapter
│   │   ├── anthropic-provider.ts # Anthropic adapter
│   │   ├── ollama-provider.ts  # Ollama adapter
│   │   ├── retriever.ts       # Vector + keyword search
│   │   └── rag-pipeline.ts    # RAG context injection
│   ├── r2.ts        # Cloudflare R2 client (NEW)
│   ├── document-processor.ts  # PDF/DOCX extraction (NEW)
│   └── embeddings.ts         # Embedding generation (NEW)
├── app/
│   └── api/
│       ├── chat/              # SSE streaming chat (NEW)
│       ├── conversations/    # Conversation CRUD (NEW)
│       ├── documents/        # Document listing (NEW)
│       ├── embeddings/       # Document processing (NEW)
│       └── upload/           # R2 presigned URLs (NEW)
└── components/ui/
    └── animated-ai-chat.tsx   # Chat UI component (NEW)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 16+ with pgvector extension
- Docker (for containerized deployment)
- Cloudflare R2 account (for document storage)

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/arzi?schema=public"

# NextAuth
AUTH_SECRET="your-secret-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# AI Providers (at least one required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
OLLAMA_BASE_URL="http://localhost:11434"

# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="chatbot-documents"
R2_PUBLIC_URL="https://pub-your-account.r2.dev"
```

### Quick Start

```bash
# Install dependencies
bun install

# Start PostgreSQL + pgvector with Docker
docker-compose -f docker-compose.db.yml up -d

# Generate Prisma Client
bun prisma generate

# Push schema to database
bun prisma db push

# Start development server
bun dev
```

## 📋 Implementation Tasks

The following tasks have been planned for implementation:

| # | Task | Status |
|---|------|--------|
| 1 | Project scaffolding - Next.js + TypeScript + Tailwind + shadcn | Planned |
| 2 | Database setup - PostgreSQL + pgvector + Prisma schema | Planned |
| 3 | Document upload - Cloudflare R2 storage | Planned |
| 4 | Document processing - parsing, chunking, embedding | Planned |
| 5 | AI provider abstraction layer - configurable models | Planned |
| 6 | RAG pipeline - vector search and context injection | Planned |
| 7 | Chat API - streaming, conversations, message history | Planned |
| 8 | Auth integration and user personalization | Planned |

## 🔐 Authentication & Authorization

### NextAuth v5 Setup

- **Strategy**: Credentials (username/password)
- **Session**: JWT-based
- **Password Hashing**: bcrypt

### Per-User AI Settings

Users can configure:
- Default AI provider (OpenAI, Anthropic, Ollama)
- Default model per provider
- Personal API keys (use own credits)

## 🐳 Docker Deployment

```bash
# Start database
docker-compose -f docker-compose.db.yml up -d

# Start app
docker-compose up -d
```

## 📁 Project Structure

```
chatbot-rag-arzi/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── (public)/          # Public pages (chat UI)
│   │   └── api/              # API routes
│   ├── features/              # Feature-based modules
│   ├── components/ui/         # shadcn/ui components
│   ├── lib/                    # Infrastructure
│   │   └── ai/               # AI providers & RAG
│   ├── providers/             # React providers
│   └── hooks/                 # Global hooks
├── prisma/                     # Prisma ORM
│   └── schema.prisma         # Database schema with pgvector
├── docker-compose.db.yml       # PostgreSQL + pgvector
└── .env.example               # Environment template
```

## 🧪 Testing

```bash
bun test              # Run unit tests
bun test:watch        # Watch mode
bun test:coverage     # With coverage
bun test:e2e         # Playwright E2E tests
```

## 📝 License

MIT License

---

Made with ❤️ by [Arzi Tech](https://arzi.com)
