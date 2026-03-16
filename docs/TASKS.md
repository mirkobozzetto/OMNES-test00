# Student Management App - Task Breakdown

**Version**: 1.0
**Date**: 2026-03-16
**Based on**: docs/PRD.md v1.0, docs/ARCHITECTURE.md v1.0

---

## Dependency Graph

```
Task 1 (Setup)
  ├── Task 2 (DB Schema + Seed)
  │     └── Task 3 (CRUD API)
  │           ├── Task 4 (Reorder API)
  │           │     └─┐
  │           └── Task 6 (CRUD Forms) ──┐
  └── Task 5 (DataTable)               │
        ├── Task 6 (CRUD Forms)         │
        └── Task 7 (Drag & Drop) ──────┘
                                        │
                                  Task 8 (UX Polish)
```

---

## Task 1: Project Setup

**Complexity**: Medium
**Blocked by**: None

**Description**:
Initialiser le monorepo pnpm avec 3 packages (frontend, backend, shared). Configurer TypeScript strict, Vite 8.0.0, Hono 4.12.8, et les scripts workspace.

**Files**:

- `package.json` (workspace root)
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas.ts`
- `packages/shared/src/types.ts`
- `packages/backend/package.json`
- `packages/backend/tsconfig.json`
- `packages/frontend/package.json`
- `packages/frontend/tsconfig.json`
- `packages/frontend/vite.config.ts`
- `packages/frontend/index.html`
- `packages/frontend/src/main.tsx`
- `packages/frontend/src/App.tsx`
- `packages/frontend/src/index.css`
- `.gitignore`

**Acceptance Criteria**:

- [ ] `pnpm install` succeeds without errors
- [ ] `packages/shared/src/schemas.ts` contient tous les schemas Zod (student, create, update, reorder, pagination)
- [ ] `packages/shared/src/types.ts` exporte les types inferes (Student, CreateStudent, UpdateStudent, PaginationParams, PaginatedResponse, ErrorResponse)
- [ ] TypeScript compile sans erreur dans les 3 packages
- [ ] Vite 8 demarre sur le frontend (`pnpm dev:frontend`)
- [ ] Structure de dossiers conforme a ARCHITECTURE.md

---

## Task 2: Database Schema + Seed

**Complexity**: Medium
**Blocked by**: Task 1

**Description**:
Configurer Prisma 7.5.0 avec le modele Student, creer la migration initiale et le script de seed pour 2000 etudiants realistes.

**Files**:

- `packages/backend/prisma/schema.prisma`
- `packages/backend/prisma/seed.ts`
- `packages/backend/src/lib/prisma.ts`

**Acceptance Criteria**:

- [ ] `schema.prisma` definit le modele Student avec tous les champs (id cuid, firstName, lastName, email unique, dateOfBirth, grade, enrollmentDate, sortOrder default 0, createdAt, updatedAt)
- [ ] `prisma migrate dev --name init` cree la table Student dans SQLite
- [ ] `seed.ts` utilise `@faker-js/faker` avec `faker.seed(42)` pour reproductibilite
- [ ] Seed insere exactement 2000 etudiants via `createMany`
- [ ] sortOrder sequentiel de 0 a 1999
- [ ] Emails uniques generes pour chaque etudiant
- [ ] Grades parmi: 6eme, 5eme, 4eme, 3eme, 2nde, 1ere, Terminale
- [ ] `prisma.ts` exporte un singleton PrismaClient

---

## Task 3: CRUD API Endpoints

**Complexity**: High
**Blocked by**: Task 2

**Description**:
Implementer les 5 endpoints CRUD REST avec Hono 4.12.8, validation Zod sur les inputs, et le format de reponse standardise.

**Files**:

- `packages/backend/src/index.ts`
- `packages/backend/src/routes/students.ts`
- `packages/backend/src/middleware/cors.ts`
- `packages/backend/src/lib/validators.ts`

**Acceptance Criteria**:

- [ ] `GET /api/students` retourne `PaginatedResponse<Student>` avec pagination server-side
- [ ] `GET /api/students` supporte les query params: page, pageSize (25/50/100), sortBy, sortOrder, search
- [ ] `GET /api/students?search=john` filtre sur firstName, lastName, email (case-insensitive)
- [ ] `GET /api/students/:id` retourne un Student ou 404
- [ ] `POST /api/students` valide avec `createStudentSchema`, retourne 201 + Student cree
- [ ] `POST /api/students` avec email existant retourne 400
- [ ] `PUT /api/students/:id` valide avec `updateStudentSchema`, retourne Student modifie
- [ ] `PUT /api/students/:id` avec id inexistant retourne 404
- [ ] `DELETE /api/students/:id` supprime et retourne `{ success: true }`
- [ ] `DELETE /api/students/:id` avec id inexistant retourne 404
- [ ] Erreurs de validation Zod retournent 400 avec format `{ error, details }`
- [ ] CORS configure pour `http://localhost:5173`
- [ ] Backend ecoute sur port 3000

---

## Task 4: Reorder API Endpoint

**Complexity**: Medium
**Blocked by**: Task 3

**Description**:
Implementer le endpoint PATCH pour reordonner un etudiant avec mise a jour atomique des sortOrder affectes via transaction Prisma.

**Files**:

- `packages/backend/src/routes/students.ts` (ajout du endpoint PATCH)

**Acceptance Criteria**:

- [ ] `PATCH /api/students/:id/reorder` accepte `{ newSortOrder: number }`
- [ ] Valide avec `reorderSchema`
- [ ] Utilise `prisma.$transaction` pour atomicite
- [ ] Si newSortOrder > oldSortOrder : decremente les lignes entre old+1 et new
- [ ] Si newSortOrder < oldSortOrder : incremente les lignes entre new et old-1
- [ ] Met a jour la ligne cible avec le nouveau sortOrder
- [ ] Retourne `{ success: true }` en cas de succes
- [ ] Retourne 404 si l'etudiant n'existe pas
- [ ] Retourne 400 si newSortOrder invalide

---

## Task 5: DataTable Component

**Complexity**: High
**Blocked by**: Task 1

**Description**:
Creer le composant DataTable avec TanStack Table 8.21.3, incluant colonnes, tri server-side, recherche debouncee, pagination et toggle de visibilite des colonnes.

**Files**:

- `packages/frontend/src/components/students/StudentTable.tsx`
- `packages/frontend/src/components/students/StudentRow.tsx`
- `packages/frontend/src/hooks/useStudents.ts`
- `packages/frontend/src/lib/api.ts`
- `packages/frontend/src/lib/query-client.ts`

**Acceptance Criteria**:

- [ ] Table affiche les colonnes: firstName, lastName, email, grade, enrollmentDate, sortOrder
- [ ] Colonnes triables avec indicateur visuel (fleche asc/desc)
- [ ] Tri declenche un appel API avec `sortBy` et `sortOrder`
- [ ] Champ de recherche avec debounce 300ms
- [ ] Recherche declenche un appel API avec `search` et reset page a 1
- [ ] Pagination: boutons prev/next, indicateur de page courante, selecteur pageSize (25/50/100)
- [ ] Toggle de visibilite des colonnes (dropdown)
- [ ] `useStudents` hook utilise `useQuery` avec queryKey reactif aux params
- [ ] `api.ts` contient les fonctions fetch typees pour chaque endpoint
- [ ] `query-client.ts` configure le QueryClient avec staleTime et gcTime
- [ ] Responsive: colonnes masquees sur mobile si necessaire

---

## Task 6: CRUD Forms

**Complexity**: High
**Blocked by**: Task 3, Task 5

**Description**:
Creer les formulaires de creation/edition en modal (shadcn Dialog) avec validation Zod, le dialog de confirmation de suppression, et les hooks de mutation TanStack Query.

**Files**:

- `packages/frontend/src/components/students/StudentForm.tsx`
- `packages/frontend/src/components/students/DeleteConfirmDialog.tsx`
- `packages/frontend/src/hooks/useStudents.ts` (ajout mutations)

**Acceptance Criteria**:

- [ ] Modal Create avec champs: firstName, lastName, email, dateOfBirth, grade, enrollmentDate
- [ ] Modal Edit pre-rempli avec les donnees de l'etudiant selectionne
- [ ] Validation Zod inline (erreurs sous chaque champ)
- [ ] Submit Create appelle `useCreateStudent` (POST), ferme le modal, toast succes
- [ ] Submit Edit appelle `useUpdateStudent` (PUT), ferme le modal, toast succes
- [ ] Bouton Delete sur chaque ligne ouvre `DeleteConfirmDialog`
- [ ] Confirmation Delete appelle `useDeleteStudent` (DELETE), toast succes
- [ ] Toutes les mutations invalident le cache `['students']` via `queryClient.invalidateQueries`
- [ ] Erreurs API affichees en toast
- [ ] Composants shadcn/ui utilises: Dialog, Button, Input, Label, Select, AlertDialog
- [ ] Bouton "Ajouter un etudiant" au-dessus de la table

---

## Task 7: Drag & Drop Integration

**Complexity**: High
**Blocked by**: Task 4, Task 5

**Description**:
Integrer @dnd-kit/react 0.3.2 dans la DataTable pour le reordonnancement des lignes par drag & drop avec optimistic updates.

**Files**:

- `packages/frontend/src/components/students/DraggableRow.tsx`
- `packages/frontend/src/components/students/StudentTable.tsx` (modification pour DnD)
- `packages/frontend/src/hooks/useStudents.ts` (ajout useReorderStudent)

**Acceptance Criteria**:

- [ ] Chaque ligne a un drag handle (icone GripVertical de lucide-react)
- [ ] `DraggableRow` utilise `useSortable` de @dnd-kit/react
- [ ] Feedback visuel pendant le drag: opacite 0.5, ombre portee
- [ ] Curseur `grab` au survol du handle, `grabbing` pendant le drag
- [ ] `DragDropProvider` wrappe la table avec `onDragEnd` handler
- [ ] On drop: optimistic update du cache TanStack Query (reorder les items localement)
- [ ] On drop: appel `useReorderStudent` mutation (PATCH /api/students/:id/reorder)
- [ ] On success: invalidation du cache pour re-fetch les donnees a jour
- [ ] On error: rollback automatique du cache (snapshot precedent restaure)
- [ ] Drag & drop fonctionne dans le scope de la page courante

---

## Task 8: UX Polish

**Complexity**: Medium
**Blocked by**: Task 6, Task 7

**Description**:
Finaliser l'UX avec loading states, gestion d'erreurs, empty states, toasts, et layout responsive.

**Files**:

- `packages/frontend/src/components/layout/AppLayout.tsx`
- `packages/frontend/src/components/ui/skeleton.tsx` (shadcn)
- `packages/frontend/src/components/ui/sonner.tsx` (toast provider)
- `packages/frontend/src/App.tsx` (modification layout + providers)
- `packages/frontend/src/main.tsx` (modification providers)

**Acceptance Criteria**:

- [ ] `AppLayout` avec header (titre app), zone de contenu principale
- [ ] Loading skeletons affiches pendant le chargement initial de la table (5-10 lignes fantomes)
- [ ] Etat d'erreur avec message et bouton "Reessayer" si l'API echoue
- [ ] Empty state avec illustration/icone et message quand search retourne 0 resultats
- [ ] Sonner (toast provider) monte dans App.tsx
- [ ] Toasts sur toutes les actions CRUD (succes + erreur)
- [ ] Layout responsive: table scrollable horizontalement sur mobile
- [ ] Header sticky sur la table
- [ ] Tailwind CSS 4 utilise pour tout le styling
- [ ] Aucun `console.log` residuel dans le code
