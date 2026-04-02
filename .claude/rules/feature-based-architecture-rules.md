# Feature-Based Architecture Rules

## Purpose

Dokumen ini mendefinisikan aturan arsitektur **Feature-Based Architecture** dalam project Next.js.

Tujuan utama:

* memisahkan domain aplikasi berdasarkan **fitur**
* meningkatkan **scalability** project
* mempermudah maintenance
* memudahkan AI agent menghasilkan code yang konsisten
* menghindari folder global yang tidak terstruktur

Arsitektur ini menggantikan pendekatan **layer-based architecture** seperti:

```
components/
services/
hooks/
utils/
```

yang sering menyebabkan codebase sulit dipelihara pada project besar.

---

# Core Principles

Semua code harus mengikuti prinsip berikut:

1. **Code diorganisir berdasarkan fitur**
2. **Setiap fitur bersifat self-contained**
3. **Fitur tidak boleh mengakses internal fitur lain**
4. **Shared code harus berada di folder shared**
5. **Data layer berada di dalam feature**

---

# Project Structure

Gunakan struktur berikut:

```text
src/
  app/
  features/
  shared/
  lib/
  types/
```

---

# Feature Folder Structure

Setiap fitur harus memiliki struktur berikut:

```text
features/
  users/
    api/
    queries/
    mutations/
    components/
    hooks/
    types.ts
    keys.ts
    index.ts
```

Penjelasan:

| Folder     | Purpose                          |
| ---------- | -------------------------------- |
| api        | fungsi komunikasi dengan backend |
| queries    | TanStack Query query factory     |
| mutations  | TanStack Query mutation factory  |
| components | UI khusus fitur                  |
| hooks      | custom hooks fitur               |
| types.ts   | type definitions                 |
| keys.ts    | query key factory                |

---

# Rule 1 — Semua Domain Harus Berada di Feature

Setiap domain bisnis harus dibuat sebagai feature.

Contoh:

```text
features/
  users/
  posts/
  auth/
  orders/
```

Jangan membuat struktur seperti ini:

BAD

```text
components/users
services/users
hooks/users
```

GOOD

```text
features/users
```

---

# Rule 2 — Feature Harus Self-Contained

Semua logic fitur harus berada dalam folder fitur tersebut.

Contoh:

```text
features/users
  api/get-users.ts
  queries/users.query.ts
  components/users-table.tsx
```

Feature tidak boleh bergantung pada internal folder fitur lain.

---

# Rule 3 — Gunakan Public API Pattern

Setiap feature harus memiliki **entry point** melalui `index.ts`.

Contoh:

```text
features/users/index.ts
```

```ts
export * from "./components/users-table"
export * from "./queries/users.query"
export * from "./mutations/create-user.mutation"
```

Import harus menggunakan entry point.

GOOD

```ts
import { UsersTable } from "@/features/users"
```

BAD

```ts
import { UsersTable } from "@/features/users/components/users-table"
```

---

# Rule 4 — Shared Code Harus di Folder Shared

Code yang digunakan oleh banyak feature harus berada di:

```text
shared/
```

Struktur:

```text
shared/
  components/
  hooks/
  utils/
  constants/
```

Contoh:

```text
shared/components/button.tsx
shared/hooks/use-debounce.ts
shared/utils/format-date.ts
```

---

# Rule 5 — Global Infrastructure di lib

Folder `lib` digunakan untuk:

* konfigurasi library
* infrastructure code
* provider

Contoh:

```text
lib/
  react-query/
  auth/
  prisma/
  logger/
```

Contoh:

```text
lib/react-query/query-client.ts
```

---

# Rule 6 — Feature Components Hanya untuk Feature

Component dalam feature hanya boleh digunakan oleh feature tersebut.

Contoh:

```text
features/users/components/user-card.tsx
```

Jika component digunakan oleh banyak feature, pindahkan ke:

```text
shared/components
```

---

# Rule 7 — Data Layer di Feature

Semua data fetching harus berada dalam feature.

Contoh:

```text
features/users
  api/get-users.ts
  queries/users.query.ts
  mutations/create-user.mutation.ts
```

Jangan membuat folder global seperti:

BAD

```text
services/
api/
```

---

# Rule 8 — Query Key Harus Berbasis Feature

Query key harus berasal dari feature.

Contoh:

```ts
export const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
}
```

---

# Rule 9 — Page Harus Menggunakan Feature

Folder `app` hanya boleh mengimpor dari feature.

Contoh:

```ts
import { UsersTable } from "@/features/users"
```

Folder `app` tidak boleh berisi business logic.

---

# Rule 10 — Server Prefetch Harus Menggunakan Query Feature

Server component harus menggunakan query dari feature.

Contoh:

```ts
await queryClient.prefetchQuery(usersListQuery())
```

---

# Rule 11 — Feature Tidak Boleh Bergantung Circular

Feature tidak boleh mengimport feature lain secara circular.

BAD

```text
users -> orders -> users
```

GOOD

```text
users -> shared
orders -> shared
```

---

# Rule 12 — Type Safety

Semua feature harus memiliki type definitions.

Contoh:

```ts
export interface User {
  id: string
  name: string
  email: string
}
```

---

# Example Feature

Contoh feature lengkap:

```text
features/posts
  api/
    get-posts.ts
    create-post.ts

  queries/
    posts.query.ts

  mutations/
    create-post.mutation.ts

  components/
    posts-list.tsx
    post-card.tsx

  hooks/
    use-post-filter.ts

  keys.ts
  types.ts
  index.ts
```

---

# Expected Result

Dengan mengikuti rules ini:

* struktur project scalable
* codebase modular
* domain logic terisolasi
* dependency jelas
* AI agent dapat menghasilkan code yang konsisten
* project siap berkembang menjadi aplikasi besar
