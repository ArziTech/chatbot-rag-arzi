# Fetching Rules – HydrationBoundary Pattern

## Purpose

Dokumen ini berisi aturan penggunaan **HydrationBoundary pattern** pada Next.js App Router untuk memastikan proses data fetching:

* konsisten
* efisien
* tidak terjadi double fetch
* memanfaatkan SSR dan client cache secara optimal

Pattern ini menggunakan kombinasi:

* **Server Component**
* **Query Prefetching**
* **HydrationBoundary**
* **Client Component dengan useQuery**

---

# Core Principles

1. **Server melakukan prefetch data terlebih dahulu**
2. **Client tidak melakukan initial fetch**
3. **Data dihydrate dari server ke client**
4. **Query key harus identik antara server dan client**
5. **Semua client query harus berasal dari server prefetch jika digunakan di halaman awal**

---

# Architecture Pattern

```
Server Component
      │
      │ prefetchQuery
      ▼
QueryClient
      │
      │ dehydrate
      ▼
HydrationBoundary
      │
      ▼
Client Component
      │
      │ useQuery
      ▼
React UI
```

---

# Directory Structure

Gunakan struktur berikut:

```
src/
  app/
    dashboard/
      page.tsx

  features/
    users/
      queries.ts
      api.ts
      components/
        users-list.tsx

  lib/
    react-query/
      query-client.ts
      hydration.ts
```

---

# Rule 1 — Query Definition Harus Terpusat

Semua query harus didefinisikan dalam file `queries.ts`.

**Contoh**

```ts
// features/users/queries.ts

export const usersQuery = {
  queryKey: ["users"],
  queryFn: getUsers,
}
```

Agent **tidak boleh membuat query inline di component**.

---

# Rule 2 — Server Component Harus Prefetch Query

Setiap halaman yang menggunakan data harus melakukan **prefetch di server component**.

**Contoh**

```tsx
// app/dashboard/page.tsx

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/react-query/query-client"
import { usersQuery } from "@/features/users/queries"
import UsersList from "@/features/users/components/users-list"

export default async function Page() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(usersQuery)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersList />
    </HydrationBoundary>
  )
}
```

---

# Rule 3 — Client Component Hanya Menggunakan useQuery

Client component **tidak boleh memanggil fetch langsung**.

Gunakan `useQuery`.

**Contoh**

```tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { usersQuery } from "../queries"

export default function UsersList() {
  const { data, isLoading } = useQuery(usersQuery)

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

---

# Rule 4 — Query Key Harus Identik

Query key di server dan client **harus sama persis**.

```
GOOD
["users"]

BAD
["user"]
["users-list"]
```

Perbedaan query key akan menyebabkan:

* cache miss
* double fetching
* hydration mismatch

---

# Rule 5 — Hindari Fetch di Client Tanpa Query

Agent **dilarang membuat code berikut**:

```
useEffect + fetch
axios di component
fetch langsung di client component
```

Semua data fetching client harus melalui **React Query**.

---

# Rule 6 — Query dengan Parameter

Jika query memiliki parameter, gunakan **query factory**.

```
features/posts/queries.ts
```

```ts
export const postsQuery = (page: number) => ({
  queryKey: ["posts", page],
  queryFn: () => getPosts(page),
})
```

Server:

```ts
await queryClient.prefetchQuery(postsQuery(1))
```

Client:

```ts
useQuery(postsQuery(1))
```

---

# Rule 7 — Multiple Query Prefetch

Jika halaman membutuhkan banyak data, lakukan **parallel prefetch**.

```
await Promise.all([
  queryClient.prefetchQuery(usersQuery),
  queryClient.prefetchQuery(postsQuery(1)),
])
```

---

# Rule 8 — Gunakan Suspense Jika Dibutuhkan

Untuk halaman besar, gunakan React Suspense.

```
<Suspense fallback={<Loading />}>
  <UsersList />
</Suspense>
```

---

# Rule 9 — Mutation Tidak Menggunakan HydrationBoundary

Mutation harus menggunakan `useMutation`.

Contoh:

```ts
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries(["users"])
  },
})
```

---

# Rule 10 — Hindari Double Fetch

Double fetch biasanya terjadi karena:

* query key berbeda
* server tidak melakukan prefetch
* client memanggil fetch manual

Agent harus memastikan:

```
Server prefetchQuery
+
Client useQuery dengan queryKey sama
```

---

# Example Full Flow

## Server

```
page.tsx
```

```tsx
const queryClient = getQueryClient()

await queryClient.prefetchQuery(usersQuery)

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <UsersList />
  </HydrationBoundary>
)
```

---

## Client

```
users-list.tsx
```

```tsx
const { data } = useQuery(usersQuery)
```

---

# Expected Result

Dengan mengikuti rules ini:

* tidak ada **double fetch**
* SSR dan client cache berjalan optimal
* performa lebih cepat
* struktur code konsisten
* AI agent dapat menghasilkan code yang predictable
