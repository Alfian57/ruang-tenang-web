# Ruang Tenang Web

Frontend untuk aplikasi Ruang Tenang - Platform Kesehatan Mental.

## Tech Stack

- **Next.js 15** dengan App Router
- **React 19**
- **Tailwind CSS v4** - CSS-first configuration
- **shadcn/ui** - Component library berbasis Radix UI
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling dan validation
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Buat file `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka http://localhost:3000

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, register)
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── chat/           # AI Chat
│   │   ├── articles/       # Artikel
│   │   ├── music/          # Musik Relaksasi
│   │   ├── mood/           # Mood Tracker
│   │   └── profile/        # Profil User
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   └── ui/                 # shadcn UI components
├── lib/
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions
├── stores/
│   └── authStore.ts        # Zustand auth store
└── types/
    └── index.ts            # TypeScript types
```

## Features

- **Landing Page** - Hero, fitur, CTA
- **Authentication** - Login & Register dengan validasi
- **Dashboard** - Quick actions & greeting
- **AI Chat** - Session management, real-time messaging
- **Articles** - Kategori, search, filter
- **Music Player** - Kategori, playlist, audio controls
- **Mood Tracker** - Record & history
- **Profile** - Update profil & password

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```
