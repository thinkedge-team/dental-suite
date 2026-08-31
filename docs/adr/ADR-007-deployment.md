# ADR-007: Cloud-First vs On-Premise Deployment

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — Deployment strategy for Think Edge Dental Suite

---

## Context

Indonesian dental clinics vary in technical sophistication. Some may prefer:
1. **Cloud-hosted SaaS** — Think Edge manages servers, client accesses via browser
2. **On-premise deployment** — Client runs software on their own server/hardware

**Factors:**
- Most target clients are SMB dental chains (3-10 branches) — not IT-heavy
- Regulatory: UU PDP data localization (Indonesian data must stay in Indonesia)
- Network reliability varies (some clinics have unreliable internet)
- IT capability: most clinics have no dedicated IT staff

---

## Decision

**Cloud-first (Vercel + Railway) as default. On-premise available as enterprise option with higher price.**

**Default (90% of clients):**
- Frontend: Vercel (Next.js hosting, CDN, edge functions)
- Database: Railway (managed PostgreSQL, Jakarta region)
- Storage: Cloudflare R2 (object storage for images, docs — S3-compatible)
- Domain: `[clinic-slug].thinkedge.id` or custom domain

**Enterprise on-premise (10% of clients, large clinic chains, government hospitals):**
- Docker Compose package
- Client runs on their own server (VPS or bare metal)
- Think Edge provides setup + annual support contract
- Higher license fee (IDR 10M+ setup + IDR 5M/month)

---

## Alternatives Considered

### Option A: Cloud-Only (Rejected — Too Rigid)

**Architecture:** Everything on Vercel + Railway, no on-premise option ever.

**Pros:**
- Simpler ops (one deployment model)
- No Docker packaging needed
- Automatic updates for all clients

**Cons:**
- Loses enterprise deals (government hospitals, large clinic chains require on-prem)
- Some clients distrust cloud (medical data on "someone else's server")
- Regulatory concern: if Railway/Vercel data center is not in Indonesia, UU PDP compliance is harder

**Verdict:** Too rigid. Enterprise clients will ask for on-prem. Worth supporting even if rare.

---

### Option B: On-Premise Primary (Rejected)

**Architecture:** Primary delivery model is Docker package, installed at client's server.

**Pros:**
- Full data control for client
- Works offline (if clinic server is on local network)
- Some enterprise clients prefer this

**Cons:**
- **Deployment complexity:** Every update = visit client site or remote SSH session
- **Support burden:** "My server won't start" calls at 2 AM
- **Version fragmentation:** Client A on v1.2, Client B on v1.8, bugfix takes 3x longer
- **No CI/CD:** Can't auto-deploy to 50 on-prem clients
- **Client IT requirement:** Clinic needs someone to manage server (most don't have IT staff)
- **Cost of support:** On-prem support is 5x more expensive than cloud support
- **No telemetry:** Can't see errors, usage patterns, performance issues

**Verdict:** Not viable as primary model. Indonesian SMB clinics have no IT staff.

---

### Option C: Cloud-First + On-Premise Option (Chosen)

**Architecture:**
- **Cloud (default):** Vercel + Railway, zero-ops for clinic
- **On-premise (enterprise add-on):** Docker Compose, self-hosted, higher price
- **Same codebase:** Docker image built from same code, just different env vars

**Pros:**
- 90% of clients get simple cloud (zero IT burden)
- 10% enterprise clients get on-prem (win deals worth 5x revenue)
- One codebase, two delivery models
- Cloud → auto-updates; on-prem → manual update per release

**Cons:**
- Must maintain Docker Compose config (1-2 days one-time work)
- On-prem clients need support contract (priced accordingly)
- Version management: ensure old on-prem versions still get security patches

**Verdict:** Best commercial flexibility with manageable complexity.

---

## Cloud Stack Decision: Vercel + Railway

### Frontend: Vercel

**Why Vercel:**
- First-class Next.js support (same company)
- Global CDN (fast in Indonesia via Singapore/Tokyo edge nodes)
- Preview deployments (every PR gets preview URL for QA)
- Automatic HTTPS
- Vercel Analytics (Core Web Vitals built-in)
- Price: $20/month (Pro, needed for team features)

**Alternative considered: Railway for Next.js**
- Railway can host Next.js via Nixpacks
- Slightly cheaper ($5/month)
- But: no edge CDN, no preview deployments, worse Next.js support
- **Verdict:** Vercel worth the premium for Next.js hosting

**Alternative considered: AWS Amplify / Render**
- Amplify: complex setup, AWS ecosystem lock-in
- Render: good option, but Vercel's Next.js support is superior
- **Verdict:** Vercel wins on DX and Next.js compatibility

---

### Database: Railway PostgreSQL

**Why Railway:**
- Managed PostgreSQL (no DBA needed)
- Jakarta region available (UU PDP compliant — data stays in Indonesia)
- Automatic backups (daily, 7-day retention on Pro)
- Connection pooling built-in (PgBouncer)
- Price: $5-20/month depending on usage
- Easy scale-up (click to increase resources)

**Alternative considered: Supabase**
- Singapore region (closest to Indonesia, acceptable for most clients)
- Built-in connection pooling
- But: ADR-002 decided against Supabase for auth/DB complexity reasons
- **Verdict:** Railway wins for simplicity and Jakarta availability

**Alternative considered: Neon (serverless PostgreSQL)**
- Scales to zero (cost savings for dev/staging)
- Branching (create DB branch per PR for testing)
- Price: generous free tier
- But: no Jakarta region (Singapore only)
- **Verdict:** Consider for staging only (free tier), Railway for production

**Alternative considered: AWS RDS**
- Jakarta region available
- Enterprise-grade reliability
- But: complex setup, expensive ($50-200/month), overkill for MVP
- **Verdict:** Revisit at 1000+ clients

---

### Object Storage: Cloudflare R2

**Why R2:**
- S3-compatible API (works with any S3 SDK)
- **Zero egress fees** (vs S3 which charges $0.09/GB egress)
- Global CDN (via Cloudflare)
- Price: $0.015/GB storage (free 10GB/month)
- Jakarta PoP (fast in Indonesia)

**Use cases:**
- Doctor profile photos
- Clinic photos (gallery)
- CMS images (service photos, insurance logos)
- Invoice PDFs (Phase 3+)

**Alternative considered: AWS S3**
- More features, more regions
- But: egress fees expensive at scale (10TB/month = $900 egress)
- **Verdict:** R2 wins on cost for media-heavy content

**Alternative considered: Supabase Storage**
- Integrated with Supabase platform
- But: rejected Supabase (ADR-002)
- **Verdict:** R2 is simpler and cheaper

---

### Email: Resend

**Why Resend:**
- Modern API, excellent deliverability
- Next.js-native (React Email for templates)
- Free tier: 3000 emails/month (sufficient for MVP)
- Price: $20/month for 50K emails

**Use cases:**
- User invitation emails (director invites manager)
- Password reset emails
- Appointment confirmation emails (optional, WA is primary)

**Alternative considered: SendGrid**
- Industry standard, but complex setup
- **Verdict:** Resend is simpler, better DX

---

## Deployment Architecture (Cloud)

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERNET                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                  Cloudflare (DNS + CDN)                     │
│  dental-suite.thinkedge.id → Vercel                         │
│  media.thinkedge.id → Cloudflare R2                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Vercel (Next.js)                          │
│  ├── Edge Functions (middleware, auth check)                 │
│  ├── Serverless Functions (API routes, Server Actions)       │
│  └── Static Assets (patient website, cached)                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Private Network
┌─────────────────────────▼───────────────────────────────────┐
│            Railway (PostgreSQL - Jakarta)                    │
│  ├── Connection Pooler (PgBouncer)                          │
│  ├── Automatic Backups (daily)                              │
│  └── Private Network (not publicly accessible)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Cloudflare R2 (Object Storage)                   │
│  ├── doctor-photos/                                         │
│  ├── clinic-gallery/                                        │
│  └── cms-images/                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Resend (Email)                             │
│  └── Transactional emails (invitations, resets)             │
└─────────────────────────────────────────────────────────────┘
```

---

## On-Premise Deployment (Enterprise)

### Package Contents

```
dental-suite-onprem/
├── docker-compose.yml
├── .env.template
├── nginx/
│   └── nginx.conf          # Reverse proxy + SSL termination
├── scripts/
│   ├── setup.sh            # First-run setup wizard
│   ├── backup.sh           # Manual DB backup
│   └── update.sh           # Pull new Docker image, run migrations
└── README.md               # Setup instructions
```

### docker-compose.yml (On-Premise)

```yaml
version: '3.9'
services:
  app:
    image: ghcr.io/thinkedge-team/dental-suite:${VERSION:-latest}
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:3000"
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER"]
      interval: 10s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl    # Client provides SSL cert
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Update Process (On-Premise)

```bash
# scripts/update.sh
#!/bin/bash
set -e

echo "Pulling latest image..."
docker pull ghcr.io/thinkedge-team/dental-suite:${VERSION}

echo "Running database migrations..."
docker-compose run --rm app npx prisma migrate deploy

echo "Restarting app..."
docker-compose up -d --no-deps app

echo "Done! New version deployed."
```

### Pricing for On-Premise

| Component | Cloud | On-Premise |
|---|---|---|
| **License** | IDR 1.5-3.5M/month | IDR 5M/month |
| **Setup fee** | IDR 0 (self-serve) | IDR 10M (one-time) |
| **Support SLA** | Email (next business day) | Phone (4-hour response) |
| **Updates** | Automatic | Manual (Think Edge assists) |
| **Hosting** | Included | Client pays own server |

**Minimum server requirement (on-premise):**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- OS: Ubuntu 22.04 LTS
- Network: Stable internet (min 10 Mbps)
- Estimated cost: IDR 500K-2M/month (VPS from Biznet, IDCloudHost, DigitalOcean)

---

## Environments

### Development (Local)

```bash
# docker-compose.dev.yml (see devops.md)
# PostgreSQL + MailHog (local email testing)
docker compose -f docker-compose.dev.yml up -d
```

- URL: `http://localhost:3000`
- DB: `localhost:5432`
- Email: MailHog at `http://localhost:8025`

### Staging

- **Platform:** Railway (free tier database) + Vercel (preview deployment)
- **Branch:** `staging` branch auto-deploys to `staging.thinkedge.id`
- **DB:** Neon free tier (separate from production, allows destructive resets)
- **Purpose:** Client demos, QA testing, pre-production validation

### Production

- **Platform:** Vercel (Pro) + Railway (Pro, Jakarta region)
- **Branch:** `main` branch auto-deploys to `app.thinkedge.id`
- **DB:** Railway PostgreSQL (persistent, backed up daily)
- **Monitoring:** Sentry (errors) + Vercel Analytics (Core Web Vitals)

---

## UU PDP Data Residency

**Requirement:** Patient data (health records, personal info) must be stored in Indonesia.

**Compliance:**
- Railway has Jakarta region → database in Indonesia ✅
- Vercel edge functions may process data in Singapore/Tokyo (acceptable — processing vs storage)
- Cloudflare R2: nearest PoP to Indonesia is Singapore (acceptable for media, not sensitive health data)

**Edge cases:**
- Error logging (Sentry) may send error messages to US servers
  - **Mitigation:** Configure Sentry to scrub PII before sending (no patient names/phones in error messages)
- Analytics (Plausible): self-hosted in EU, privacy-first, no PII
  - **Mitigation:** Plausible doesn't track individuals, acceptable

**Documentation:**
- Terms of Service states: "Patient data stored in Jakarta, Indonesia (Railway)"
- Sentry data processing agreement signed
- Privacy Policy updated with data residency disclosure

---

## Monitoring & Observability

### Error Tracking: Sentry

```ts
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // ... next config
}, {
  org: 'thinkedge',
  project: 'dental-suite',
  silent: true,
});
```

**Alert rules:**
- New error type → Slack notification
- Error rate >10/min → PagerDuty (on-call alert)
- Slow transaction >2s → alert after 5 occurrences

**PII scrubbing:**
```ts
// sentry.client.config.ts
Sentry.init({
  beforeSend(event) {
    // Remove patient phone numbers from error messages
    if (event.message) {
      event.message = event.message.replace(/\b08\d{9,11}\b/g, '[PHONE]');
    }
    return event;
  }
});
```

### Performance: Vercel Analytics

- Core Web Vitals per page (FCP, LCP, CLS)
- Real User Monitoring (RUM)
- Free with Vercel Pro

### Database: Railway Metrics

- Query performance (slow queries)
- Connection pool utilization
- Storage usage
- Built into Railway dashboard

---

## Consequences

### Positive

1. **Zero ops for 90% of clients:** Vercel handles SSL, CDN, deploys; Railway handles backups, scaling
2. **Fast iteration:** Deploy in 2 minutes, rollback in 30 seconds
3. **Data residency:** Railway Jakarta compliant with UU PDP
4. **Enterprise optionality:** On-prem available for premium clients without architecture change
5. **Cost predictable:** Vercel $20/month + Railway $20/month = $40/month baseline (scales with usage)

### Negative

1. **Vendor dependency:** Vercel + Railway outage = platform down
2. **Cost scales with usage:** At 1000 clients, Railway cost increases (mitigated: plan upgrade, not architecture change)
3. **On-prem complexity:** Docker packaging + update scripts = 1-2 days extra work

### Mitigation Strategies

**Vendor lock-in:**
- Next.js runs on any Node.js server (Docker) — not Vercel-only
- Postgres is standard — can migrate from Railway to any provider in <1 day
- Containerized from Day 1 (Docker Compose for local dev) → easy migration

**Vercel downtime:**
- Vercel SLA: 99.99% uptime
- If downtime, patient website down but bookings blocked — acceptable for dental clinics (not ICU monitors)
- Alternative: Railway can host Next.js as fallback

**Cost at scale:**
- 1000 clients → multiple Railway DBs (sharding by region)
- Vercel Enterprise plan for volume discount
- Revisit at 100+ clients

---

## References

- [Railway pricing](https://railway.app/pricing)
- [Vercel pricing](https://vercel.com/pricing)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [UU PDP data localization requirements](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)

---

## Review Schedule

**Review trigger:** 100+ clients OR monthly infrastructure cost >$500

**If triggered:**
- Evaluate AWS Jakarta (ap-southeast-3) for DB + hosting
- Consider self-managed Kubernetes for cost efficiency at scale
- Evaluate CDN strategy (Cloudflare Workers for edge compute)

**Expected:** Current stack handles 500+ clients, no changes needed for 2+ years.
