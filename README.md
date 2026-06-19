# ERP1

Monorepo con frontend React en `frontend/` y backend Node.js en `backend/`.

## Estado actual

El trabajo principal queda centrado en el backend y ya esta organizado con una arquitectura onion:

- `src/domain`
- `src/application`
- `src/infrastructure`
- `src/presentation`

La base de datos de referencia sale de [bd.md](./bd.md) y la configuracion principal se toma desde el `.env` raiz.

## Backend

Stack:

- Node.js
- TypeScript
- `tsx`
- TypeORM
- PostgreSQL (`pg`)
- JWT con `jose`
- correo con `nodemailer`

### Endpoints principales

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/catalogs/reference-data`
- `GET /api/admin/catalogs/*`
- `GET /api/admin/dashboard/summary`
- `GET /api/admin/reports/purchases`
- `GET /api/admin/reports/inventory`
- `GET /api/admin/reports/payables`
- `GET /api/admin/masters/*`
- `GET /api/admin/operations/*`
- `POST /api/admin/operations/purchases/complete`

Los endpoints de administracion de tablas requieren autenticacion y rol `ADMIN` o `SUPERADMIN`.

### Scripts

Desde `backend/`:

```bash
npm run dev
npm run build
npm run test
npm run db:migrate
```

## Frontend

El frontend esta en `frontend/` y se ejecuta desde esa carpeta.

```bash
cd frontend
npm run dev
npm run build
```

## Variables de entorno

El backend lee primero el `.env` raiz y luego, si existe, `backend/.env`.

El archivo [`.env.example`](./.env.example) refleja las variables principales del proyecto.

El esquema completo del ERP esta definido en `docker/postgres/init.sql` y tambien en la migracion `backend/src/infrastructure/db/typeorm/migrations/1700000000000-core-schema.ts`.

## Docker

Levantar todo el stack:

```bash
docker compose up --build
```

Servicios expuestos:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- PostgreSQL: interno en la red de Docker

El frontend usa Nginx como servidor estatico y proxyea `/api` hacia el backend.

## Sincronizacion GitHub -> Azure DevOps

El repositorio incluye un workflow de GitHub Actions en [`.github/workflows/mirror-to-azure-devops.yml`](./.github/workflows/mirror-to-azure-devops.yml) para reflejar cada `push` hacia Azure DevOps.

### Requisito

Crear en GitHub un secret llamado `AZURE_DEVOPS_PAT` con un Personal Access Token de Azure DevOps que tenga permiso de `Code (Read & write)` sobre el repositorio destino.

### Comportamiento

- Cada `push` a GitHub intenta publicar la misma rama o tag en Azure DevOps.
- El repositorio destino es `https://dev.azure.com/erp-maquinarias1/ERP-COMPRAS/_git/ERP-COMPRAS`.
- El flujo es unidireccional: GitHub es la fuente principal y Azure DevOps recibe el espejo.
