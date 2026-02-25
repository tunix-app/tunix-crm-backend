# Tunix CRM Backend

## Links
- **Repository**: https://github.com/tunix-app/tunix-crm-backend
- **Kanban Board**: https://github.com/orgs/tunix-app/projects/3/views/1

## Stack
- **Runtime**: Node.js v22, TypeScript
- **Framework**: NestJS v11
- **Database**: PostgreSQL via Supabase, queried with Knex.js
- **Auth**: Passport.js + JWT (Supabase JWT strategy)
- **Package manager**: Yarn
- **Deploy**: Docker → Fly.io (app: `tunix-crm-backend`, region: DFW)

## Commands
```bash
yarn dev              # Start with file watching
yarn build            # Compile TypeScript (nest build)
yarn start:prod       # Run compiled output
yarn test             # Unit tests (Jest)
yarn test:e2e         # End-to-end tests
yarn lint             # ESLint with auto-fix
yarn format           # Prettier
yarn migrate:latest   # Apply pending Knex migrations
yarn migrate:rollback # Rollback last migration batch
```

## Environment Variables
Required in `.env`:
```
NODE_ENV=
DATABASE_URL=          # Supabase pooled connection (PgBouncer)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
```
Optional: `DIRECT_URL` (for migrations), `PORT` (defaults to 3000)

## Architecture
- Feature modules per domain: `auth`, `client`, `user`, `session`, `note`, `health`
- `KnexModule` is a global module — `KnexService` is available everywhere
- Entity types live in `src/types/db/`, DTOs in `src/types/dto/`
- Global `ValidationPipe` with `transform: true` — DTOs are auto-transformed
- Global `AllExceptionsFilter` returns standardized JSON error responses
- Migrations use timestamp-based naming under `migrations/`
