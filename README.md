# Ruang Tenang Web

Frontend aplikasi Ruang Tenang.

## Checklist Quickstart

- [x] Dependency terpasang.
- [x] `.env.local` terisi `NEXT_PUBLIC_API_BASE_URL`.
- [x] Dev server berjalan.
- [x] Build produksi lulus.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Zustand
- React Hook Form + Zod
- Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn

### Setup Cepat

1. Install dependency:

```bash
npm install
```

2. Buat `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

3. Jalankan dev server:

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

## Fitur Utama

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

## Catatan Fokus Produk

- Prioritaskan kualitas flow utama: dashboard, chat, forum, progress, rewards.
- Fitur eksplorasi seperti stories/mini game dijaga sebagai pelengkap, bukan pusat navigasi utama.
