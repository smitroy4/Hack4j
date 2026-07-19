# Hack4j

A free, community-driven engineering education platform. *A community that lives 10 years ahead.*

Hack4j provides video-based courses and learning content focused on deep engineering topics — Java & Spring Boot, React, full-stack development, DevOps, cloud, Kubernetes, AI-integrated systems, distributed systems, microservices, and system design at scale. It is a **community, not a marketplace**: members contribute content, projects, and discussions, and active learners can become publishers.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript |
| **Authentication** | NextAuth v5 (Credentials + Google OAuth, JWT) |
| **Database** | PostgreSQL via Neon Serverless |
| **ORM** | Prisma 7 |
| **Styling** | Tailwind CSS v4 + shadcn/ui components |
| **Animation** | Motion, tsParticles |
| **Video** | Custom YouTube IFrame player |
| **Rich Text** | TipTap |
| **Validation** | react-hook-form + Zod |
| **Icons** | Lucide React |

## Features

- **Course Catalog** — Browse and search published courses with category filters
- **Course Enrollment** — One-click enrollment, progress tracking per lesson
- **Video Lessons** — Custom YouTube player with playback speed, quality selector, captions, keyboard shortcuts, seek controls
- **Resizable Sidebar** — Course navigation with sections, lesson checkmarks, progress ring, instructor notes, and resources
- **Dashboard** — Overview with continue-learning and my-courses sections
- **Bookmarks** — Save and manage bookmarked lessons
- **Profile** — Editable profile with social links, bio, education, experience
- **Admin Panel** — Owner-only course, section, lesson, and category management with TipTap editor for instructor notes
- **Rich Text Notes** — Timestamped lesson notes
- **Search** — Full-text course search
- **Dark/Light Mode** — Theme toggle with system preference detection
- **Animated UI** — Particle backgrounds, gradient animations, and page transitions

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and fill in:
# - DATABASE_URL (Neon PostgreSQL pooled connection)
# - DIRECT_URL (Neon PostgreSQL direct connection)
# - AUTH_SECRET (random string for JWT encryption)
# - AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET (Google OAuth credentials)
# - OWNER_EMAIL (email address for admin access)

# Run database migrations
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── (landing)/         # Landing page route group
│   ├── (dashboard)/       # Dashboard route group (authenticated)
│   ├── (course)/          # Course browsing route group
│   ├── auth/              # Login & register pages
│   └── api/               # REST API routes
├── components/            # Shared UI components
│   └── ui/                # shadcn/ui primitives
├── features/              # Feature modules
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (auth config, env validation)
├── prisma/                # Schema & client
├── services/              # Business logic
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## Database Models

- **User** — Accounts, profiles, social links, education, experience
- **Course** — Published/draft courses with categories
- **Section** — Ordered course sections
- **Lesson** — YouTube video lessons with duration, instructor notes, resources
- **Enrollment** — User-to-course enrollment (unique constraint)
- **LessonProgress** — Per-user per-lesson progress (current time, completion, percentage)
- **Bookmark** — Per-user per-lesson bookmarks
- **Note** — Timestamped rich-text notes per lesson
- **Category** — Course categories

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
