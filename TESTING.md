# Testing Strategy — ruang-tenang-web

## Target Komposisi

- Component Testing (utama): **70% - 80%**
- Unit Test (pendukung): **10% - 15%**
- E2E Test (alur kritis): **5% - 15%**

## Struktur

- `tests/components/*` → fokus perilaku UI komponen
- `tests/unit/*` → utilitas pure function + schema validation
- `tests/e2e/*` → alur user paling penting end-to-end

## Konvensi Penamaan File

- Gunakan **`.test.ts` / `.test.tsx`** untuk Vitest (`tests/components` dan `tests/unit`)
- Gunakan **`.spec.ts`** untuk Playwright (`tests/e2e`)
- Nama file harus deskriptif berdasarkan domain/perilaku, contoh:
	- `validations-forum-chat.test.ts`
	- `register-validation.spec.ts`
- Hindari mencampur jenis test dalam satu folder (mis. E2E di `tests/unit`)

## Implementasi Saat Ini

- Component test files: **149** (**78.01%**)
- Unit test files: **28** (**14.66%**)
- E2E test files: **14** (**7.33%**)

Distribusi file saat ini **sudah sesuai target komposisi**:

- Component: target 70% - 80% → saat ini 78.01%
- Unit: target 10% - 15% → saat ini 14.66%
- E2E: target 5% - 15% → saat ini 7.33%

## Menjalankan Test

```bash
npm run test:component
npm run test:unit
npm run test:e2e
```

Untuk semua test berbasis Vitest:

```bash
npm run test:run
```

## CI (GitHub Actions)

Workflow: `.github/workflows/test.yml`

- Trigger: `pull_request` ke `main`, `push` ke `main`, dan `workflow_dispatch`
- Job 1: Component + Unit Coverage Gate (`npm run test:coverage`)
- Job 2: E2E Kritis (`npm run test:e2e` dengan Playwright Chromium)

### Coverage Gate (Vitest)

Coverage threshold minimum saat ini (anti-regression baseline):

- Lines: `>= 10`
- Statements: `>= 10`
- Functions: `>= 9`
- Branches: `>= 8`
