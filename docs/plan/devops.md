# DevOps & Deployment Plan

> **Phase 3.5 Deliverable**
> Local development environment, CI/CD pipeline, staging, production deployment, secrets management, monitoring.

---

## Local Development Environment

### docker-compose.yml

See `docker-compose.yml` in repo root. Services:

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | Local database |
| `mailhog` | `mailhog/mailhog` | 1025 (SMTP), 8025 (UI) | Email testing (catches all outbound emails) |

**Start dev environment:**
```bash
docker compose up -d          # start services
npx prisma migrate dev        # apply migrations
npx prisma db seed            # load demo data
npm run dev                   # start Next.js (http://localhost:3000)
```

**Reset dev database:**
```bash
docker compose down -v        # remove containers + volumes
docker compose up -d          # recreate fresh
npx prisma migrate dev        # re-apply all migrations
npx prisma db seed            # re-seed demo data
```

---

### Environment Variables

**`.env.local` (local dev — never committed):**
```bash
# Database
DATABASE_URL="postgresql://dental:dental@localhost:5432/dental_suite"

# Auth
AUTH_SECRET="dev-secret-min-32-chars-replace-in-prod"
NEXTAUTH_URL="http://localhost:3000"

# Email (MailHog local)
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_FROM="noreply@dental-suite.local"

# Storage (local dev: skip Cloudflare R2, use /public/uploads)
STORAGE_PROVIDER="local"
NEXT_PUBLIC_STORAGE_URL="http://localhost:3000"

# Analytics (disabled in dev)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=""
```

**`.env.example` (committed — template for new devs):**
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/dental_suite"
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://app.thinkedge.id"
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@thinkedge.id"
CLOUDFLARE_R2_ACCOUNT_ID=""
CLOUDFLARE_R2_ACCESS_KEY_ID=""
CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
CLOUDFLARE_R2_BUCKET_NAME="dental-suite-media"
NEXT_PUBLIC_STORAGE_URL="https://media.thinkedge.id"
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="app.thinkedge.id"
SENTRY_DSN=""
NEXT_PUBLIC_APP_URL="https://app.thinkedge.id"
```

---

### Seed Script

```ts
// prisma/seed.ts
import { PrismaClient, Role } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo organization...');

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-klinik' },
    update: {},
    create: {
      name: 'Klinik Gigi Senyum Sehat',
      slug: 'demo-klinik',
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: false,
      moduleIntelligence: false,
    },
  });

  const branch1 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'kelapa-gading' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Kelapa Gading',
      slug: 'kelapa-gading',
      address: 'Jl. Boulevard Raya No. 123, Kelapa Gading, Jakarta Utara',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      whatsapp: '6281234567890',
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'pluit' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Pluit',
      slug: 'pluit',
      address: 'Jl. Pluit Indah No. 45, Pluit, Jakarta Utara',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      whatsapp: '6281234567891',
      isActive: true,
    },
  });

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123456', 12);

  await prisma.user.upsert({
    where: { email: 'director@demo.com' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Dr. Budi Santoso',
      email: 'director@demo.com',
      passwordHash: hashedPassword,
      role: Role.DIRECTOR,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      organizationId: org.id,
      branchId: branch1.id,
      name: 'Sari Wijaya',
      email: 'manager@demo.com',
      passwordHash: hashedPassword,
      role: Role.MANAGER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@demo.com' },
    update: {},
    create: {
      organizationId: org.id,
      branchId: branch1.id,
      name: 'Rina Kartika',
      email: 'staff@demo.com',
      passwordHash: hashedPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  // Create demo doctor
  const doctor = await prisma.doctor.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'dr-andi-pratama' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Andi Pratama',
      slug: 'dr-andi-pratama',
      title: 'drg.',
      specialty: 'Dokter Gigi Umum',
      bio: 'Dokter gigi berpengalaman 5 tahun.',
      isActive: true,
    },
  });

  // Assign doctor to branches
  await prisma.branchDoctor.upsert({
    where: { branchId_doctorId: { branchId: branch1.id, doctorId: doctor.id } },
    update: {},
    create: { branchId: branch1.id, doctorId: doctor.id },
  });

  // Create weekly schedule (Mon-Thu)
  for (const day of [1, 2, 3, 4]) { // Mon=1, Thu=4
    await prisma.schedule.upsert({
      where: { doctorId_branchId_dayOfWeek: { doctorId: doctor.id, branchId: branch1.id, dayOfWeek: day } },
      update: {},
      create: {
        doctorId: doctor.id,
        branchId: branch1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotMinutes: 30,
        isActive: true,
      },
    });
  }

  // Create demo services
  const services = [
    { name: 'Pembersihan Gigi', slug: 'pembersihan-gigi', price: 250000, durationMin: 45 },
    { name: 'Penambalan Gigi', slug: 'penambalan-gigi', price: 400000, durationMin: 60 },
    { name: 'Pemutihan Gigi', slug: 'pemutihan-gigi', price: 800000, durationMin: 90 },
    { name: 'Cabut Gigi', slug: 'cabut-gigi', price: 300000, durationMin: 30 },
    { name: 'Konsultasi', slug: 'konsultasi', price: 150000, durationMin: 20 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: service.slug } },
      update: {},
      create: { organizationId: org.id, ...service, isActive: true },
    });
  }

  // Create demo insurance partners
  const insurers = [
    { name: 'BPJS Kesehatan', slug: 'bpjs' },
    { name: 'Allianz', slug: 'allianz' },
    { name: 'Prudential', slug: 'prudential' },
  ];

  for (const insurer of insurers) {
    await prisma.insurancePartner.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: insurer.slug } },
      update: {},
      create: { organizationId: org.id, ...insurer, isActive: true },
    });
  }

  console.log('Seed complete!');
  console.log('\nDemo accounts:');
  console.log('  Director: director@demo.com / demo123456');
  console.log('  Manager:  manager@demo.com  / demo123456');
  console.log('  Staff:    staff@demo.com    / demo123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to `package.json`:**
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## CI/CD Pipeline (GitHub Actions)

### PR Validation (`/.github/workflows/ci.yml`)

Runs on every PR to `main` and `staging`:

```yaml
name: CI

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main, staging]

jobs:
  validate:
    name: Lint, Typecheck, Test
    runs-on: ubuntu-latest
    timeout-minutes: 10

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: dental
          POSTGRES_PASSWORD: dental
          POSTGRES_DB: dental_suite_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://dental:dental@localhost:5432/dental_suite_test
      AUTH_SECRET: ci-secret-32-chars-minimum-length-ok
      NEXTAUTH_URL: http://localhost:3000

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Apply migrations
        run: npx prisma migrate deploy

      - name: Run unit tests
        run: npm test -- --run

      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true
```

### Test Script (`package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Vitest Configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/actions/**'],
      exclude: ['src/lib/prisma.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```ts
// tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';

beforeAll(async () => {
  // Ensure migrations applied
  await prisma.$connect();
});

afterEach(async () => {
  // Clean test data between tests
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.visit.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Environments

### Local (Developer Machine)

| Component | Value |
|---|---|
| URL | `http://localhost:3000` |
| DB | `postgresql://dental:dental@localhost:5432/dental_suite` |
| Email | MailHog (`http://localhost:8025`) |
| Storage | Local `/public/uploads/` |

### Staging

| Component | Value |
|---|---|
| URL | `https://staging.thinkedge.id` |
| Platform | Vercel preview deployment (auto on push to `staging` branch) |
| DB | Neon free tier (separate from prod) |
| Email | Resend test mode (emails logged, not delivered) |
| Deploy trigger | Push to `staging` branch |

**Staging deploy process:**
1. Developer creates feature branch
2. Opens PR to `staging`
3. CI validates (lint + typecheck + tests)
4. Merge to `staging` → Vercel deploys automatically
5. Vercel runs `prisma migrate deploy` as build step
6. QA tests on `https://staging.thinkedge.id`
7. If OK → open PR to `main`

### Production

| Component | Value |
|---|---|
| URL | `https://app.thinkedge.id` |
| Platform | Vercel Pro |
| DB | Railway PostgreSQL (Jakarta region) |
| Email | Resend (live mode) |
| Storage | Cloudflare R2 |
| Deploy trigger | Push to `main` branch |

**Production deploy process:**
1. PR from `staging` → `main` (requires 1 reviewer approval)
2. CI validates
3. Merge to `main` → Vercel deploys automatically
4. `prisma migrate deploy` runs pre-deploy (Vercel build step)
5. Zero-downtime deploy (Vercel handles)
6. Sentry release created automatically

---

## Secrets Management

### Rules

1. **Never commit secrets** to git (`.env`, `.env.local` in `.gitignore`)
2. **`.env.example`** committed with all keys (empty values or placeholders)
3. **Local dev:** `.env.local` (local only, developer creates from `.env.example`)
4. **Staging:** Vercel environment variables (set via Vercel dashboard or CLI)
5. **Production:** Vercel environment variables + Railway secrets

### Setting Secrets (Vercel CLI)

```bash
# Set production secret
vercel env add AUTH_SECRET production

# Set for all environments
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Pull all env vars to local
vercel env pull .env.local
```

### Secret Rotation

**Rotation schedule:**
- `AUTH_SECRET`: Rotate every 6 months OR on security incident
- Database credentials: Rotate every 12 months OR on team member departure
- API keys (Cloudflare, Resend, Sentry): Rotate on team member departure

**Rotation process:**
1. Generate new secret: `openssl rand -base64 32`
2. Update in Vercel dashboard (staging first, then production)
3. Redeploy
4. Verify new secret works
5. Delete old secret from all locations

### Audit: No Secrets in Git History

```bash
# Check for leaked secrets before first push
git log --all --full-history -- .env
git log -p --all -S "password" --source --all

# Or use truffleHog (automated)
pip install trufflehog
trufflehog git file://. --since-commit HEAD~10
```

---

## Database Backup Strategy

### Railway (Production)

- **Automatic daily backups:** Railway Pro includes 7-day backup retention
- **Manual backup before major migrations:**
  ```bash
  # Via Railway CLI
  railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```

### Local Backup Script

```bash
# scripts/backup-prod.sh
#!/bin/bash
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > $BACKUP_FILE
echo "Backup saved to $BACKUP_FILE"
```

### Restore Process

```bash
# Restore from backup
psql $DATABASE_URL < backup_20260901_120000.sql
```

---

## Monitoring & Alerting

### Error Tracking: Sentry

**Setup:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Alert rules:**
- New error type → Slack `#alerts` channel
- Error rate >5/min → PagerDuty on-call (Phase 2+)
- Transaction duration >3s → weekly digest

**PII scrubbing (required before Sentry sends error):**
```ts
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  beforeSend(event) {
    // Scrub patient phone numbers
    if (event.message) {
      event.message = event.message.replace(/\b(?:62|0)8\d{8,11}\b/g, '[PHONE]');
    }
    // Remove email addresses
    if (event.message) {
      event.message = event.message.replace(/\S+@\S+\.\S+/g, '[EMAIL]');
    }
    return event;
  },
});
```

### Performance: Vercel Analytics

- Built into Vercel Pro ($0 extra)
- Core Web Vitals per page (FCP, LCP, CLS, TTFB, INP)
- Real User Monitoring (actual patient device performance)

### Uptime: Better Uptime / UptimeRobot

- Monitor `https://app.thinkedge.id/api/health`
- Alert if down >2 minutes → SMS to on-call
- Free tier: 50 monitors, 5-minute checks

**Health check endpoint:**
```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
```

---

## On-Premise Deployment Package

See `ADR-007-deployment.md` for full on-premise architecture.

**Docker image build:**
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t ghcr.io/thinkedge-team/dental-suite:${{ github.ref_name }} .

      - name: Push to GitHub Container Registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/thinkedge-team/dental-suite:${{ github.ref_name }}
          docker tag ghcr.io/thinkedge-team/dental-suite:${{ github.ref_name }} ghcr.io/thinkedge-team/dental-suite:latest
          docker push ghcr.io/thinkedge-team/dental-suite:latest
```

---

## Phase 3 Exit Criteria

- [x] `docker-compose.yml` runnable locally (see repo root)
- [x] `.env.example` complete (all required vars documented)
- [x] CI workflow defined (lint + typecheck + tests + build on PR)
- [x] Staging environment strategy documented
- [x] Production stack defined (Vercel + Railway + R2)
- [x] Secrets management rules documented
- [x] Backup strategy documented
- [x] Monitoring stack defined (Sentry + Vercel Analytics + UptimeRobot)
- [ ] **Actual `docker-compose.yml` committed to repo** (next action)
- [ ] **GitHub Actions workflow committed** (next action)

---

## Next Action: Commit DevOps Files

```bash
# 1. Write docker-compose.yml to repo root
# 2. Write .github/workflows/ci.yml
# 3. Run: docker compose up -d && npx prisma migrate dev && npx prisma db seed
# 4. Verify: http://localhost:3000 loads
```
