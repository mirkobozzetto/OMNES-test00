# Student Management App - Product Requirements Document

**Version**: 1.0
**Date**: 2026-03-16
**Status**: Draft

---

## 1. Overview

**Project**: Student Management App
**Goal**: Application web de gestion d'etudiants avec DataTable interactive, operations CRUD completes et reordonnancement par drag & drop, sur une base de 2000 etudiants.
**Target users**: Administrateurs scolaires, enseignants.

### Stack technique

| Layer        | Technology                       | Version |
| ------------ | -------------------------------- | ------- |
| Frontend     | React                            | 19.2    |
| Bundler      | Vite (Rolldown)                  | 8.0.0   |
| Language     | TypeScript strict                | 5.x     |
| Backend      | Hono + @hono/node-server         | 4.12.8  |
| Runtime      | Node.js                          | 22+     |
| ORM          | Prisma                           | 7.5.0   |
| Database     | SQLite (dev) / PostgreSQL (prod) | -       |
| Table        | TanStack Table                   | 8.21.3  |
| Drag & Drop  | @dnd-kit/react                   | 0.3.2   |
| Server State | TanStack Query                   | v5      |
| Validation   | Zod                              | 3.x     |
| Styling      | Tailwind CSS                     | 4       |
| Components   | shadcn/ui                        | latest  |

---

## 2. Data Model

```prisma
model Student {
  id             String   @id @default(cuid())
  firstName      String
  lastName       String
  email          String   @unique
  dateOfBirth    DateTime
  grade          String
  enrollmentDate DateTime
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

| Field          | Type     | Constraints                              |
| -------------- | -------- | ---------------------------------------- |
| id             | String   | Primary key, CUID auto-generated         |
| firstName      | String   | Required, 1-100 chars                    |
| lastName       | String   | Required, 1-100 chars                    |
| email          | String   | Required, unique, valid email format     |
| dateOfBirth    | DateTime | Required                                 |
| grade          | String   | Required, 1-20 chars                     |
| enrollmentDate | DateTime | Required                                 |
| sortOrder      | Int      | Default 0, used for drag & drop ordering |
| createdAt      | DateTime | Auto-generated                           |
| updatedAt      | DateTime | Auto-updated                             |

---

## 3. Features

### F1 - DataTable

| Requirement | Detail                                       |
| ----------- | -------------------------------------------- |
| Affichage   | 2000 etudiants en table paginee              |
| Pagination  | Server-side, options: 25 / 50 / 100 par page |
| Tri         | Server-side sur toutes les colonnes          |
| Recherche   | Server-side sur firstName, lastName, email   |
| Colonnes    | Visibilite configurable (toggle)             |
| Responsive  | Adaptation mobile/tablet/desktop             |

### F2 - CRUD Operations

| Operation  | Implementation                                      |
| ---------- | --------------------------------------------------- |
| **Create** | Modal form avec validation Zod, toast succes        |
| **Read**   | Ligne de table + vue detail possible                |
| **Update** | Modal form pre-rempli, validation Zod, toast succes |
| **Delete** | Dialog de confirmation, toast feedback              |

Validation partagee entre frontend et backend via schemas Zod dans le package shared.

### F3 - Drag & Drop Reorder

| Requirement       | Detail                                               |
| ----------------- | ---------------------------------------------------- |
| Drag handle       | Icone de poignee sur chaque ligne                    |
| Feedback visuel   | Ombre + opacite reduite pendant le drag              |
| Optimistic update | Mise a jour immediate du cache TanStack Query        |
| Persistance       | PATCH endpoint pour sauvegarder le nouveau sortOrder |
| Rollback          | Retour a l'etat precedent en cas d'erreur API        |

---

## 4. API Endpoints

### Routes

| Method | Endpoint                    | Description                        | Request Body               | Response                     |
| ------ | --------------------------- | ---------------------------------- | -------------------------- | ---------------------------- |
| GET    | `/api/students`             | Liste paginee, triable, cherchable | -                          | `PaginatedResponse<Student>` |
| GET    | `/api/students/:id`         | Detail d'un etudiant               | -                          | `Student`                    |
| POST   | `/api/students`             | Creer un etudiant                  | `CreateStudent`            | `Student` (201)              |
| PUT    | `/api/students/:id`         | Modifier un etudiant               | `UpdateStudent`            | `Student`                    |
| PATCH  | `/api/students/:id/reorder` | Reordonner un etudiant             | `{ newSortOrder: number }` | `{ success: true }`          |
| DELETE | `/api/students/:id`         | Supprimer un etudiant              | -                          | `{ success: true }`          |

### Query Parameters pour GET /api/students

| Param     | Type   | Default   | Description                              |
| --------- | ------ | --------- | ---------------------------------------- |
| page      | number | 1         | Numero de page                           |
| pageSize  | number | 25        | Taille de page (25, 50, 100)             |
| sortBy    | string | sortOrder | Colonne de tri                           |
| sortOrder | string | asc       | Direction (asc, desc)                    |
| search    | string | -         | Recherche sur firstName, lastName, email |

### Response Format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Format

```typescript
interface ErrorResponse {
  error: string;
  details?: Record<string, string>;
}
```

| Status | Usage                    |
| ------ | ------------------------ |
| 200    | Succes (GET, PUT, PATCH) |
| 201    | Creation reussie (POST)  |
| 400    | Validation error (Zod)   |
| 404    | Ressource non trouvee    |
| 500    | Erreur serveur           |

---

## 5. Performance Requirements

| Metric                 | Target                                                    |
| ---------------------- | --------------------------------------------------------- |
| Rendu table            | 2000 lignes sans lag (virtualisation si mode pleine page) |
| Reponse API paginee    | < 200ms                                                   |
| Drag & drop            | Optimistic update, pas de spinner                         |
| Recherche              | Debounce 300ms                                            |
| First Contentful Paint | < 1.5s                                                    |
| Bundle size            | Optimise via Vite 8 Rolldown tree-shaking                 |

---

## 6. UX Requirements

| State            | Implementation                                                 |
| ---------------- | -------------------------------------------------------------- |
| **Loading**      | Skeletons sur les lignes de table au chargement initial        |
| **Error**        | Message d'erreur avec option de retry                          |
| **Empty**        | Illustration + message quand la recherche retourne 0 resultats |
| **Success CRUD** | Toast notification (create, update, delete)                    |
| **Error CRUD**   | Toast notification avec detail de l'erreur                     |
| **Validation**   | Erreurs inline sous chaque champ du formulaire                 |
| **Drag handle**  | Curseur grab/grabbing, feedback visuel                         |
| **Pagination**   | Indicateur de page courante, navigation prev/next              |

---

## 7. Non-Functional Requirements

| Requirement  | Detail                                                                            |
| ------------ | --------------------------------------------------------------------------------- |
| TypeScript   | Mode strict partout (no any, no implicit any)                                     |
| Validation   | Schemas Zod partages entre frontend et backend                                    |
| Code style   | Pas de commentaires dans le code                                                  |
| Architecture | Monorepo (packages/frontend, packages/backend, packages/shared)                   |
| ORM          | Prisma 7.5.0 avec SQLite pour le developpement                                    |
| Seed         | Script de seed avec 2000 etudiants realistes (@faker-js/faker, seed deterministe) |
| CORS         | Configure pour autoriser le frontend en developpement                             |
| Git          | Commits propres, messages descriptifs                                             |
