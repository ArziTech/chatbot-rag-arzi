# TanStack Query Advanced Rules

## Purpose

Dokumen ini mendefinisikan aturan lanjutan penggunaan **TanStack Query** dalam aplikasi Next.js modern dengan tujuan:

* memastikan data layer scalable
* menjaga konsistensi cache
* memudahkan AI agent menghasilkan code production-ready
* meminimalkan bug akibat cache conflict atau duplicate fetch

Rules ini digunakan bersama:

* Next.js App Router
* HydrationBoundary pattern
* Server Prefetching
* Feature-based architecture

---

# Architecture Overview

```text
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
     │ useQuery / useMutation
     ▼
TanStack Query Cache
```

---

# Directory Structure (Enterprise Pattern)

Gunakan struktur **feature-based architecture** berikut:

```
src/
  features/
    users/
      api/
        get-users.ts
        create-user.ts
      queries/
        users.query.ts
      mutations/
        create-user.mutation.ts
      keys.ts
      types.ts
      components/

  lib/
    react-query/
      query-client.ts
      query-provider.ts
```

Semua logic TanStack Query harus berada di dalam **feature module**.

---

# Rule 1 — Query Key Factory Pattern

Semua query key harus didefinisikan dalam **key factory**.

File:

```
features/users/keys.ts
```

Contoh:

```ts
export const usersKeys = {
  all: ["users"] as const,

  lists: () => [...usersKeys.all, "list"] as const,

  list: (filters: any) => [...usersKeys.lists(), filters] as const,

  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
}
```

Keuntungan:

* query key konsisten
* mudah invalidate cache
* scalable untuk fitur besar

---

# Rule 2 — Typed Query System

Semua query harus **typed**.

Contoh:

```ts
import { usersKeys } from "../keys"
import { getUsers } from "../api/get-users"

export const usersListQuery = () => ({
  queryKey: usersKeys.lists(),
  queryFn: getUsers,
})
```

Penggunaan:

```ts
useQuery(usersListQuery())
```

Agent **tidak boleh membuat query inline**.

---

# Rule 3 — Query Function Tidak Boleh Inline

Query function harus berasal dari API layer.

BAD:

```ts
useQuery({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users"),
})
```

GOOD:

```ts
useQuery(usersListQuery())
```

---

# Rule 4 — API Layer Separation

Semua request network harus berada dalam **api layer**.

Contoh:

```
features/users/api/get-users.ts
```

```ts
export async function getUsers() {
  const res = await fetch("/api/users")

  if (!res.ok) {
    throw new Error("Failed to fetch users")
  }

  return res.json()
}
```

API layer tidak boleh mengandung logic React Query.

---

# Rule 5 — Query Options Pattern

Query harus menggunakan **query option factory**.

Contoh:

```ts
export const userDetailQuery = (id: string) => ({
  queryKey: usersKeys.detail(id),
  queryFn: () => getUserById(id),
})
```

Penggunaan:

```ts
useQuery(userDetailQuery(userId))
```

---

# Rule 6 — Server Prefetch Integration

Jika data dibutuhkan pada initial render, server component harus melakukan prefetch.

```ts
await queryClient.prefetchQuery(usersListQuery())
```

Kemudian hydrate:

```tsx
<HydrationBoundary state={dehydrate(queryClient)}>
  <UsersList />
</HydrationBoundary>
```

Client:

```ts
useQuery(usersListQuery())
```

---

# Rule 7 — Parallel Prefetch Strategy

Jika halaman membutuhkan beberapa query, gunakan parallel prefetch.

```ts
await Promise.all([
  queryClient.prefetchQuery(usersListQuery()),
  queryClient.prefetchQuery(postsListQuery()),
])
```

Ini meningkatkan **server rendering performance**.

---

# Rule 8 — Mutation Factory Pattern

Semua mutation harus menggunakan **mutation factory**.

Contoh:

```
features/users/mutations/create-user.mutation.ts
```

```ts
import { createUser } from "../api/create-user"

export const createUserMutation = {
  mutationFn: createUser,
}
```

Client:

```ts
useMutation(createUserMutation)
```

---

# Rule 9 — Automatic Cache Invalidation

Mutation harus menginvalidate cache menggunakan query key factory.

Contoh:

```ts
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: usersKeys.all,
    })
  },
})
```

Keuntungan:

* cache tetap konsisten
* tidak perlu manual refetch

---

# Rule 10 — Optimistic Updates Pattern

Untuk mutation yang memodifikasi list data gunakan **optimistic update**.

Contoh:

```ts
onMutate: async (newUser) => {
  await queryClient.cancelQueries(usersKeys.lists())

  const previous = queryClient.getQueryData(usersKeys.lists())

  queryClient.setQueryData(usersKeys.lists(), (old: any[]) => [
    ...old,
    newUser,
  ])

  return { previous }
}
```

Jika error:

```ts
onError: (err, newUser, context) => {
  queryClient.setQueryData(usersKeys.lists(), context.previous)
}
```

---

# Rule 11 — Cache Strategy

Gunakan strategi cache berikut:

```
staleTime: 60 seconds
gcTime: 5 minutes
retry: 1
refetchOnWindowFocus: false
```

Contoh:

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

# Rule 12 — Infinite Query Pattern

Untuk infinite scroll gunakan `useInfiniteQuery`.

Query factory:

```ts
export const postsInfiniteQuery = () => ({
  queryKey: ["posts", "infinite"],
  queryFn: ({ pageParam = 1 }) => getPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
})
```

Client:

```ts
useInfiniteQuery(postsInfiniteQuery())
```

---

# Rule 13 — Error Boundary Integration

Error harus ditangani dengan React Error Boundary.

Contoh:

```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <UsersList />
</ErrorBoundary>
```

---

# Rule 14 — Suspense Mode

Jika menggunakan Suspense gunakan:

```ts
useSuspenseQuery()
```

atau:

```ts
useQuery({
  ...usersListQuery(),
  suspense: true,
})
```

---

# Rule 15 — Jangan Gunakan TanStack Query Untuk

TanStack Query **tidak digunakan untuk**:

* UI state
* form state
* modal state
* local component state

Gunakan:

* React state
* Zustand
* Server Actions

---

# Expected Result

Dengan mengikuti rules ini:

* data fetching scalable
* cache konsisten
* mutation predictable
* query key terstruktur
* AI agent dapat menghasilkan code production-ready
* aplikasi lebih mudah di-maintain
