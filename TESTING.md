# Testing Strategy — ruang-tenang-web

## Target Komposisi

- Component Testing (utama): **70% - 80%**
- Unit Test (pendukung): **10% - 15%**
- E2E Test (alur kritis): **5% - 15%**

## Struktur

- `tests/components/*` → fokus perilaku UI komponen
- `tests/unit/*` → utilitas pure function + schema validation
- `tests/e2e/*` → alur user paling penting end-to-end

## Implementasi Saat Ini

- Component test files: **7**
- Unit test files: **2**
- E2E test files: **1**

Distribusi file saat ini mendekati komposisi target dengan dominasi component test.

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
