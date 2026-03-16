# Student Management App

Application de gestion d'etudiants avec DataTable interactive, CRUD complet et drag & drop.

## Stack

| Layer      | Tech                          | Version             |
| ---------- | ----------------------------- | ------------------- |
| Frontend   | React + Vite + TanStack Table | 19.2 / 8.0 / 8.21.3 |
| Backend    | Hono + Node.js                | 4.12.8 / 22+        |
| ORM        | Prisma + SQLite               | 7.5.0               |
| DnD        | @dnd-kit/react                | 0.3.2               |
| Validation | Zod (shared)                  | 3.x                 |
| Styling    | Tailwind CSS 4                | 4                   |

## Features

- DataTable paginee server-side (25/50/100 par page) sur 2000 etudiants
- Tri server-side sur toutes les colonnes
- Recherche server-side (nom, prenom, email) avec debounce 300ms
- CRUD complet : creation/edition en modal, suppression avec confirmation
- Drag & drop pour reordonner les lignes (persistance en base)
- Validation Zod partagee entre frontend et backend
- Design minimaliste monochrome (Notion-like)

## Architecture

```
packages/
├── shared/     Schemas Zod + types TypeScript
├── backend/    API REST Hono + Prisma 7.5 + SQLite
└── frontend/   React 19.2 + Vite 8 + TanStack Table
```

## Demarrage

```bash
pnpm install
cd packages/backend && npx prisma migrate dev --name init
cd packages/backend && npx prisma generate
pnpm seed
pnpm dev
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3000

## API

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | /api/students             | Liste paginee, triable, cherchable |
| GET    | /api/students/:id         | Detail etudiant                    |
| POST   | /api/students             | Creer                              |
| PUT    | /api/students/:id         | Modifier                           |
| PATCH  | /api/students/:id/reorder | Reordonner                         |
| DELETE | /api/students/:id         | Supprimer                          |
