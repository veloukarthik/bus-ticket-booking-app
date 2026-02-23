This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## GitHub Auth Setup

To enable GitHub sign-in, configure these variables in `local.env` (or `.env.local`):

```bash
NEXTAUTH_SECRET="replace-this-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
```

In your GitHub OAuth app settings, use this callback URL for local development:

```text
http://localhost:3000/api/auth/callback/github
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Marketplace Mode

LetsGo is configured as a car-booking marketplace:

- `CUSTOMER` accounts can search rides and book seats.
- `OWNER` accounts can access the owner console (`/admin`) to manage vehicles and rides.
- Search results support `Lowest fare` and `Top rated owners` sorting, with owner rating + review count.
- Customers can submit owner reviews from completed bookings.

Apply migrations after pulling latest changes:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

## License

This project is distributed under a proprietary commercial license.
See `LICENSE` for terms.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Developer: Prisma & npx commands

Below are the common npx / Prisma commands used in this project for development, migrations, seeding and debugging. Run them from the project root. Many commands expect environment variables to be loaded from `.env` or `local.env`.

1) Load environment (safe):

```bash
# load env into current shell (zsh)
set -a; source local.env; set +a

# or run a single command with the env file by prefixing (avoid leaking secrets into shell history):
DATABASE_URL="postgres://..." npx prisma migrate deploy --schema=prisma/schema.prisma
```

2) Migrations

```bash
# Create & apply a development migration (interactive / local DB)
npx prisma migrate dev --schema=prisma/schema.prisma --name init

# Create migration files only (do not apply)
npx prisma migrate dev --create-only --schema=prisma/schema.prisma --name init

# Apply migrations in non-interactive environments (CI / production)
npx prisma migrate deploy --schema=prisma/schema.prisma
```

3) Generate Prisma Client

```bash
npx prisma generate --schema=prisma/schema.prisma
```

4) Introspect / pull schema from an existing database

```bash
npx prisma db pull --schema=prisma/schema.prisma
```

5) Execute raw SQL via Prisma

```bash
# Use stdin
echo "SELECT 1;" | npx prisma db execute --schema=prisma/schema.prisma --stdin

# Or use a file
npx prisma db execute --schema=prisma/schema.prisma --file=/tmp/script.sql
```

6) Prisma Studio (GUI to inspect database)

```bash
npx prisma studio --schema=prisma/schema.prisma
```

7) Seed the database (project-specific)

# This project includes a `prisma/seed` or `prisma/seed.ts`/`seed.js` file. Run the project's seed script if present:

```bash
# If package.json has a seed script
npm run seed

# Or run the seed script directly (JS/TS)
node prisma/seed.js
# or, if TS: npx ts-node prisma/seed.ts
```

8) Troubleshooting & tips

- If Prisma reports a provider mismatch (P3019) between the schema and migration history, you likely switched providers (sqlite <-> postgres). Back up `prisma/migrations` and `prisma/migrations/migration_lock.toml` before reinitializing migrations.
- Use `--env-file` where supported, or `set -a; source local.env; set +a` to load a local env that contains secrets like `DATABASE_URL`.
- For migrating SQLite -> Postgres data, use `pgloader` (recommended) or CSV/Node scripts. Always back up `dev.db` first.

If you want, I can add project-specific examples for seeding and migrating based on your environment (local Docker Postgres, CI, or provider). 

## Developer: Replace site images for premium look

For a crisp, premium visual feel replace the banner and logo with high-resolution images in `public/`:

- `public/banner.png` (fallback)
- `public/banner@2x.png` (high-res 2x used via srcSet if present)
- `public/letsgo.png` (logo)
- `public/letsgo@2x.png` (high-res logo)

Drop the files in `public/` and the homepage will automatically prefer `banner@2x.png` when available. I can help source or resize assets if you want.
