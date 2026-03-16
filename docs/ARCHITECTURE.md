# Student Management App - Technical Architecture

**Version**: 1.0
**Date**: 2026-03-16
**Based on**: docs/PRD.md v1.0

---

## 1. Project Structure

```
student-management-app/
├── package.json                    (workspace root)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── packages/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── components.json         (shadcn/ui config)
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css            (Tailwind CSS 4 imports)
│   │       ├── components/
│   │       │   ├── ui/              (shadcn/ui generated)
│   │       │   ├── students/
│   │       │   │   ├── StudentTable.tsx
│   │       │   │   ├── StudentForm.tsx
│   │       │   │   ├── StudentRow.tsx
│   │       │   │   ├── DeleteConfirmDialog.tsx
│   │       │   │   └── DraggableRow.tsx
│   │       │   └── layout/
│   │       │       └── AppLayout.tsx
│   │       ├── hooks/
│   │       │   └── useStudents.ts
│   │       ├── lib/
│   │       │   ├── api.ts
│   │       │   └── query-client.ts
│   │       └── types/
│   │           └── index.ts
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── routes/
│   │       │   └── students.ts
│   │       ├── middleware/
│   │       │   └── cors.ts
│   │       └── lib/
│   │           ├── prisma.ts
│   │           └── validators.ts
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts             (barrel export)
│           ├── schemas.ts           (Zod schemas)
│           └── types.ts             (TypeScript types inferred from Zod)
└── tsconfig.base.json
```

---

## 2. Technical Decisions

### 2.1 Monorepo Strategy

| Decision        | Detail                                                               |
| --------------- | -------------------------------------------------------------------- |
| Package manager | pnpm workspaces                                                      |
| Structure       | 3 packages: frontend, backend, shared                                |
| Shared package  | Zod schemas + TypeScript types, importe via `@student-app/shared`    |
| TypeScript      | Chaque package a son propre tsconfig qui etend tsconfig.base.json    |
| Build           | Pas de build pour shared (import direct des sources .ts via bundler) |

### 2.2 Database Strategy

| Decision            | Detail                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| ORM                 | Prisma 7.5.0                                                               |
| Dev database        | SQLite (fichier `packages/backend/prisma/dev.db`, zero config)             |
| Prod database       | PostgreSQL (meme schema, datasource differente via env)                    |
| Migrations          | `prisma migrate dev` pour dev, `prisma migrate deploy` pour prod           |
| Features Prisma 7.5 | Nested transaction rollbacks via savepoints, improved TypeScript inference |

### 2.3 Pagination Strategy

| Decision             | Detail                                                                            |
| -------------------- | --------------------------------------------------------------------------------- |
| Type                 | Server-side offset pagination                                                     |
| Raison               | Plus simple a combiner avec le reordonnancement par sortOrder                     |
| Page size par defaut | 25 (options: 25, 50, 100)                                                         |
| Total count          | Retourne dans le body (`pagination.total`)                                        |
| Implementation       | `prisma.student.findMany({ skip, take })` + `prisma.student.count()` en parallele |

### 2.4 Drag & Drop Strategy

| Step          | Detail                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------- |
| Library       | @dnd-kit/react 0.3.2 avec DragDropProvider + useSortable                                  |
| Trigger       | Drag handle (icone GripVertical) sur chaque ligne                                         |
| On drag start | Reduire opacite de la ligne draggee a 0.5                                                 |
| On drop       | 1. Optimistic update du cache TanStack Query (reorder local)                              |
|               | 2. PATCH /api/students/:id/reorder avec `{ newSortOrder }`                                |
| Backend       | Transaction Prisma : shift les sortOrder des lignes affectees, puis update la ligne cible |
| On error      | Rollback via `onError` du `useMutation` : restaurer le cache precedent                    |
| Scope         | Reorder dans la page courante uniquement                                                  |

### 2.5 API Design

| Decision     | Detail                                                              |
| ------------ | ------------------------------------------------------------------- |
| Framework    | Hono 4.12.8 avec @hono/node-server                                  |
| Routing      | Hono router avec groupement sous `/api/students`                    |
| Validation   | Zod parse sur chaque body/query entrant (schemas du package shared) |
| Error format | `{ error: string, details?: Record<string, string> }`               |
| CORS         | Middleware Hono autorisant `http://localhost:5173` en dev           |
| Port         | Backend sur 3000, Frontend Vite sur 5173                            |
| Proxy        | Vite proxy `/api` vers `http://localhost:3000` en dev               |

---

## 3. Shared Schemas (Zod)

`packages/shared/src/schemas.ts` :

```typescript
import { z } from "zod";

export const studentSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  dateOfBirth: z.coerce.date(),
  grade: z.string().min(1).max(20),
  enrollmentDate: z.coerce.date(),
  sortOrder: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createStudentSchema = studentSchema.omit({
  id: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStudentSchema = createStudentSchema.partial();

export const reorderSchema = z.object({
  newSortOrder: z.number().int().min(0),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((v) => [25, 50, 100].includes(v), {
      message: "pageSize must be 25, 50, or 100",
    })
    .default(25),
  sortBy: z
    .enum([
      "firstName",
      "lastName",
      "email",
      "grade",
      "enrollmentDate",
      "sortOrder",
    ])
    .default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  search: z.string().optional(),
});
```

`packages/shared/src/types.ts` :

```typescript
import type { z } from "zod";
import type {
  studentSchema,
  createStudentSchema,
  updateStudentSchema,
  paginationSchema,
} from "./schemas";

export type Student = z.infer<typeof studentSchema>;
export type CreateStudent = z.infer<typeof createStudentSchema>;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, string>;
}
```

---

## 4. API Response Format

### Success Responses

```typescript
// GET /api/students
{
  data: Student[],
  pagination: { page: 1, pageSize: 25, total: 2000, totalPages: 80 }
}

// GET /api/students/:id
Student

// POST /api/students (201)
Student

// PUT /api/students/:id
Student

// PATCH /api/students/:id/reorder
{ success: true }

// DELETE /api/students/:id
{ success: true }
```

### Error Responses

```typescript
// 400 - Validation Error
{
  error: "Validation failed",
  details: { email: "Invalid email format", firstName: "Required" }
}

// 404 - Not Found
{ error: "Student not found" }

// 500 - Server Error
{ error: "Internal server error" }
```

---

## 5. Seed Script Architecture

`packages/backend/prisma/seed.ts` :

| Decision        | Detail                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| Library         | @faker-js/faker                                                                 |
| Reproducibilite | `faker.seed(42)` pour des donnees deterministes                                 |
| Nombre          | 2000 etudiants                                                                  |
| Noms            | Mix francais/anglais via `faker.person.firstName()` / `faker.person.lastName()` |
| Email           | `faker.internet.email({ firstName, lastName })` avec unicite garantie           |
| Grade           | Random parmi un set defini (6eme, 5eme, 4eme, 3eme, 2nde, 1ere, Terminale)      |
| dateOfBirth     | Entre 2005 et 2012                                                              |
| enrollmentDate  | Entre 2023 et 2026                                                              |
| sortOrder       | Sequentiel 0 a 1999                                                             |
| Insertion       | `prisma.student.createMany({ data })` en batch unique                           |
| Pre-seed        | `prisma.student.deleteMany()` pour idempotence                                  |

---

## 6. Dependency Map

### packages/frontend/package.json

```json
{
  "dependencies": {
    "react": "^19.2",
    "react-dom": "^19.2",
    "@tanstack/react-table": "^8.21.3",
    "@tanstack/react-query": "^5",
    "@dnd-kit/react": "^0.3.2",
    "@student-app/shared": "workspace:*",
    "zod": "^3.24",
    "sonner": "^2"
  },
  "devDependencies": {
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5.7",
    "tailwindcss": "^4",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```

### packages/backend/package.json

```json
{
  "dependencies": {
    "hono": "^4.12.8",
    "@hono/node-server": "^1.13",
    "@prisma/client": "^7.5.0",
    "@student-app/shared": "workspace:*",
    "zod": "^3.24"
  },
  "devDependencies": {
    "prisma": "^7.5.0",
    "@faker-js/faker": "^9",
    "tsx": "^4",
    "typescript": "^5.7"
  }
}
```

### packages/shared/package.json

```json
{
  "dependencies": {
    "zod": "^3.24"
  },
  "devDependencies": {
    "typescript": "^5.7"
  }
}
```

---

## 7. Data Flow

```
[User Action] → [React Component] → [TanStack Query Hook] → [API Client (fetch)]
                                                                      ↓
                                                              [Hono Backend]
                                                                      ↓
                                                            [Zod Validation]
                                                                      ↓
                                                            [Prisma 7.5 ORM]
                                                                      ↓
                                                              [SQLite / PG]
                                                                      ↓
                                                            [JSON Response]
                                                                      ↓
                                                    [TanStack Query Cache Update]
                                                                      ↓
                                                          [React Re-render]
```

### Drag & Drop Flow

```
[User Drags Row] → [DragDropProvider onDragEnd]
       ↓
[Optimistic Cache Update] → [UI Updates Immediately]
       ↓
[useMutation: PATCH /api/students/:id/reorder]
       ↓
[Hono: Prisma $transaction]
  ├── [Shift affected rows sortOrder]
  └── [Update target row sortOrder]
       ↓
[Success] → [Invalidate query cache]
[Error]  → [Rollback cache to previous snapshot]
```
