# Data Access Layer Rules

## Purpose

Dokumen ini mendefinisikan aturan penggunaan **Data Access Layer (DAL)** dalam aplikasi Next.js.

Tujuan utama:

* memisahkan akses database dari UI layer
* menjaga keamanan akses data
* membuat query konsisten dan mudah diuji
* memastikan AI agent selalu menggunakan pola akses database yang aman
* menghindari logic database tersebar di Server Components atau Server Actions

Semua interaksi database **harus melalui Data Access Layer**.

---

# Core Principles

Semua akses database harus mengikuti prinsip berikut:

1. **UI Layer tidak boleh mengakses database langsung**
2. **Semua query harus melalui Data Access Layer**
3. **DAL tidak boleh mengandung logic UI**
4. **Semua DAL function harus mengembalikan hasil standar**
5. **Error harus dikontrol dan tidak melempar exception langsung**

---

# Architecture Overview

```text
Server Component / Server Action
        │
        ▼
Feature Layer
        │
        ▼
Data Access Layer (DAL)
        │
        ▼
Database Client
```

Dengan arsitektur ini:

* UI hanya memanggil **DAL**
* DAL mengatur **auth, error handling, dan database access**
* database tidak pernah diakses langsung oleh UI

---

# Directory Structure

Gunakan struktur berikut:

```text
src/
  features/
    [feature-name]/
      dal/
        queries.ts
        mutations.ts
        helpers.ts
        types.ts
```

Penjelasan:

| File         | Purpose                      |
| ------------ | ---------------------------- |
| queries.ts   | operasi read dari database   |
| mutations.ts | operasi create/update/delete |
| helpers.ts   | wrapper DAL                  |
| types.ts     | tipe return dan error        |

---

# Rule 1 — Tidak Boleh Query Database di UI Layer

Database tidak boleh diakses langsung di:

* Server Components
* Server Actions
* API Routes

BAD

```ts
const users = await db.query.users.findMany()
```

GOOD

```ts
const result = await getUsers()
```

---

# Rule 2 — Semua Database Access Harus di DAL

Semua query database harus berada di dalam:

```text
features/[feature]/dal
```

Contoh:

```text
features/users/dal/queries.ts
features/users/dal/mutations.ts
```

UI hanya boleh mengimpor fungsi dari DAL.

---

# Rule 3 — Standardized Return Type

Semua fungsi DAL harus mengembalikan tipe `DALReturn<T>`.

Contoh:

```ts
type DALError =
  | "no_user"
  | "no_access"
  | "db_error"
  | "not_found"
  | "unknown_error"

export type DALReturn<T> =
  | { success: true; data: T }
  | { success: false; error: DALError }
```

Tujuan:

* memastikan error predictable
* mempermudah UI menangani response
* menghindari exception yang tidak tertangani

---

# Rule 4 — Jangan Throw Error untuk Error yang Diharapkan

DAL tidak boleh melempar error untuk kondisi yang diprediksi.

BAD

```ts
if (!user) {
  throw new Error("Not logged in")
}
```

GOOD

```ts
return { success: false, error: "no_user" }
```

Exception hanya boleh terjadi untuk **unexpected runtime crash**.

---

# Rule 5 — Gunakan DAL Helpers

Semua operasi DAL harus menggunakan helper wrapper.

Contoh helper:

```ts
dalDbOperation()
dalRequireAuth()
```

Tujuan helper:

* menangani database error
* menangani authentication
* mengurangi duplikasi try/catch

---

# Rule 6 — DAL Database Wrapper

Gunakan `dalDbOperation` untuk operasi database.

Contoh:

```ts
export async function getItems() {
  return dalDbOperation(async () => {
    return db.query.items.findMany()
  })
}
```

Helper ini akan otomatis menangani:

* database crash
* exception handling

---

# Rule 7 — Authentication Wrapper

Jika query membutuhkan user login, gunakan `dalRequireAuth`.

Contoh:

```ts
export async function updateItemName(itemId: string, newName: string) {
  return dalRequireAuth(async (user) => {
    return dalDbOperation(async () => {
      return db
        .update(items)
        .set({ name: newName })
        .where(eq(items.id, itemId))
    })
  })
}
```

Wrapper ini akan otomatis menangani:

* user tidak login
* akses tidak diizinkan

---

# Rule 8 — Role Based Access

Jika operasi membutuhkan role tertentu, definisikan pada wrapper.

Contoh:

```ts
return dalRequireAuth(
  async (user) => {
    return dalDbOperation(async () => {
      return db.update(...)
    })
  },
  ["admin", "editor"]
)
```

Jika role tidak sesuai maka return:

```ts
{ success: false, error: "no_access" }
```

---

# Rule 9 — DAL Tidak Boleh Mengandung Logic UI

DAL tidak boleh melakukan:

* redirect
* rendering UI
* manipulasi response HTTP

BAD

```ts
redirect("/login")
```

GOOD

```ts
return { success: false, error: "no_user" }
```

UI layer yang menentukan behavior.

---

# Rule 10 — Handling DAL Result di UI Layer

Server Component atau Server Action harus memeriksa status `success`.

Contoh:

```tsx
const result = await getDashboardData()

if (!result.success) {
  if (result.error === "no_access") {
    return <AccessDenied />
  }

  return <ErrorUI />
}

const data = result.data
```

---

# Rule 11 — Helper untuk Auto Handling

Untuk behavior default gunakan helper:

```ts
dalVerifySuccess(result)
```

Contoh:

```ts
const data = dalVerifySuccess(await getDashboardData())
```

Helper ini dapat:

* redirect login
* redirect unauthorized
* throw error untuk crash

---

# Rule 12 — DAL Tidak Boleh Mengandung Business Logic Besar

DAL hanya bertanggung jawab untuk:

* mengambil data
* menyimpan data
* memvalidasi akses

Business logic kompleks harus berada di:

```text
features/[feature]/services
```

---

# Rule 13 — Separation Query dan Mutation

DAL harus memisahkan operasi read dan write.

Contoh:

```text
dal/
  queries.ts
  mutations.ts
```

Queries:

* getUsers
* getPosts

Mutations:

* createUser
* updatePost
* deletePost

---

# Agent Checklist Before Generating Code

Sebelum menulis kode database, AI agent harus memastikan:

1. Apakah query berada di folder DAL?
2. Apakah function mengembalikan `DALReturn<T>`?
3. Apakah helper `dalDbOperation` digunakan?
4. Apakah authentication wrapper digunakan jika diperlukan?
5. Apakah UI layer memeriksa status `success`?

---

# Expected Result

Dengan mengikuti rules ini:

* database access aman dan terkontrol
* error handling konsisten
* code lebih mudah diuji
* business logic terpisah dari UI
* AI agent dapat menghasilkan code yang predictable dan production-ready
