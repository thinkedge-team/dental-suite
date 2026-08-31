# ADR-005: Auth.js JWT vs Session-Based Authentication

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — Authentication strategy for Next.js App Router

---

## Context

Next.js 16 App Router introduces React Server Components (RSC), changing how authentication works. We need to decide between:

1. **JWT-based auth** — stateless tokens, no database lookup per request
2. **Session-based auth** — stateful sessions stored in database, lookup per request

**Requirements:**
- Works seamlessly with RSC (server components can read auth state)
- Supports complex RBAC (5 roles, per-branch permissions, module flags)
- Multi-tenant (must include `organizationId` in session)
- Scales to 50K users
- UU PDP compliant (session invalidation, audit logging)

---

## Decision

**Auth.js v5 with JWT sessions**

- Token type: JWT (signed, not encrypted)
- Token storage: httpOnly cookie
- Token contents: `{ userId, organizationId, role, branchIds, moduleAccess }`
- Token lifetime: 30 days (rolling refresh)
- Credential provider: email + bcrypt password

---

## Alternatives Considered

### Option A: Session-Based Auth (Database Sessions) — Rejected

**Architecture:**
- User logs in → create session record in `sessions` table
- Session ID stored in httpOnly cookie
- Every request: lookup session in database
- Auth.js DatabaseAdapter (Prisma)

**Flow:**
```
User request
  ↓
Middleware reads sessionId from cookie
  ↓
Query: SELECT * FROM sessions WHERE id = sessionId
  ↓
If valid → load user data
  ↓
Attach user to request context
```

**Pros:**

1. **Instant invalidation:** Delete session from DB → user logged out immediately
2. **Session management:** Can view all active sessions, revoke individually
3. **Audit trail:** Session table shows login time, last activity, IP address
4. **Security:** Compromised token can be revoked without user re-login

**Cons:**

1. **Database hit per request:**
   - Every page load = 1 DB query to fetch session
   - 50K users × 10 requests/day = 500K DB queries/day just for auth
   - With JWT: 0 DB queries (token is self-contained)

2. **RSC complexity:**
   - Server Components run during SSR (server-side rendering)
   - Must pass `db` instance to every server component that needs auth
   - OR: use React context (but context doesn't work in RSC)

3. **Horizontal scaling:**
   - Multiple Next.js servers → all must query same DB for sessions
   - Requires connection pooling, adds latency

4. **Session cleanup:**
   - Expired sessions accumulate in DB
   - Need cron job to delete old sessions (housekeeping overhead)

**Verdict:** Database lookup per request is unnecessary overhead for our RBAC (user roles rarely change mid-session).

---

### Option B: JWT Sessions (Chosen)

**Architecture:**
- User logs in → generate JWT containing user data
- JWT stored in httpOnly cookie
- Every request: verify JWT signature (no DB lookup)
- JWT payload includes all RBAC data

**Flow:**
```
User request
  ↓
Middleware reads JWT from cookie
  ↓
Verify signature (crypto operation, ~1ms)
  ↓
If valid → decode payload
  ↓
User data available in { userId, organizationId, role, branchIds, moduleAccess }
```

**JWT Payload:**
```json
{
  "sub": "user_abc123",
  "organizationId": "org_xyz789",
  "role": "MANAGER",
  "branchIds": ["branch_1", "branch_2"],
  "moduleAccess": {
    "grow": true,
    "connect": true,
    "operate": false,
    "intelligence": false
  },
  "iat": 1693526400,
  "exp": 1696204800
}
```

**Pros:**

1. **Zero DB queries:** Auth check is pure crypto (fast, scales infinitely)
2. **RSC-friendly:** Server Components can call `await auth()` anywhere (no DB dependency)
3. **Stateless:** Horizontal scaling trivial (no session state to share)
4. **Fast:** JWT verify = 1ms vs 50ms+ DB query
5. **Offline-capable:** Can verify JWT even if DB is down (read-only operations work)

**Cons:**

1. **No instant invalidation:**
   - Change user role → old JWT valid until expiration (max 30 days)
   - Mitigation: short token lifetime (30 min) + refresh token pattern
   - OR: maintain JWT blacklist in Redis (defeats stateless benefit)

2. **Token size:**
   - JWT ~500 bytes (vs session ID ~16 bytes)
   - Cookie size limit: 4KB (plenty of room)

3. **Security if leaked:**
   - Compromised JWT valid until expiration
   - Mitigation: httpOnly cookie (can't be read by JS), short expiration, refresh rotation

**Verdict:** Pros (performance, RSC compatibility) outweigh cons. Instant invalidation rarely needed (user role changes are infrequent admin actions, acceptable delay).

---

### Option C: Hybrid (JWT + Session Table) — Rejected

**Architecture:**
- Use JWT for performance
- Store session record in DB for revocation capability
- On critical actions (change password, delete account), verify session still valid in DB

**Pros:**
- Performance of JWT for normal requests
- Revocation capability when needed

**Cons:**
- Complexity: two sources of truth (JWT + DB)
- When to check DB? Every request (negates JWT benefit) or only some requests (confusing)
- DB table still needs cleanup cron

**Verdict:** Complexity not worth it. Stick with pure JWT, handle rare invalidation via short expiration.

---

## Decision Matrix

| Criteria | JWT | Database Sessions | Hybrid | Weight | Winner |
|---|---|---|---|---|---|
| **Performance (req/sec)** | ✅ 10K+ | ⚠️ 1K (DB bottleneck) | ⚠️ Complex | 30% | JWT |
| **RSC compatibility** | ✅ Simple | ⚠️ Requires DB in RSC | ⚠️ Complex | 25% | JWT |
| **Horizontal scaling** | ✅ Stateless | ⚠️ Shared DB | ⚠️ Shared DB | 20% | JWT |
| **Instant invalidation** | ❌ Max 30 min delay | ✅ Immediate | ✅ Immediate | 10% | DB |
| **Security (if leaked)** | ⚠️ Valid until expire | ✅ Can revoke | ✅ Can revoke | 10% | DB |
| **Implementation complexity** | ✅ Simple | ⚠️ Medium | ❌ Complex | 5% | JWT |

**Weighted score:**
- JWT: 90/100
- Database Sessions: 60/100
- Hybrid: 55/100

---

## Implementation Details

### Auth.js Configuration

```ts
// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPortal = nextUrl.pathname.startsWith('/portal');
      
      if (isOnPortal) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true; // Public routes
    },
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.organizationId = user.organizationId;
        token.role = user.role;
        token.branchIds = user.branches.map(b => b.branchId);
        token.moduleAccess = user.organization.moduleAccess;
      }
      
      // Refresh token (update from DB every 24h)
      if (trigger === 'update' || shouldRefresh(token)) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.userId },
          include: { branches: true, organization: true }
        });
        if (fresh) {
          token.role = fresh.role;
          token.branchIds = fresh.branches.map(b => b.branchId);
          token.moduleAccess = fresh.organization.moduleAccess;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.organizationId = token.organizationId;
      session.user.role = token.role;
      session.user.branchIds = token.branchIds;
      session.user.moduleAccess = token.moduleAccess;
      return session;
    },
  },
  providers: [], // Added in auth.ts
} satisfies NextAuthConfig;
```

### Auth.js Main Config

```ts
// src/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials);
        
        if (!parsed.success) return null;
        
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email },
          include: { branches: true, organization: true }
        });
        
        if (!user) return null;
        if (!user.isActive) return null; // Account disabled
        
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;
        
        return user;
      },
    }),
  ],
});
```

### Usage in Server Components

```tsx
// app/(portal)/dashboard/page.tsx
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) return <div>Not authenticated</div>;
  
  const { user } = session;
  
  // user.organizationId, user.role, user.branchIds available
  return (
    <div>
      <h1>Welcome, {user.role}</h1>
      {user.moduleAccess.intelligence && (
        <AnalyticsDashboard orgId={user.organizationId} />
      )}
    </div>
  );
}
```

---

## Handling Role Changes

**Problem:** User role changes (STAFF → MANAGER), but JWT still says STAFF for up to 30 days.

**Solution: Token refresh every 24 hours**

```ts
function shouldRefresh(token: JWT): boolean {
  const iat = token.iat || 0; // Issued at
  const now = Math.floor(Date.now() / 1000);
  const age = now - iat;
  return age > 24 * 60 * 60; // Older than 24h
}
```

**Flow:**
1. Admin changes user role in database
2. User keeps browsing (old JWT, old role) — works fine for current page
3. After 24 hours (or next login), JWT refresh triggers
4. `jwt()` callback queries DB → gets fresh role
5. New JWT issued with updated role

**Acceptable delay:** 24 hours max. Role changes are infrequent admin actions (hiring, promotion, org structure change). If immediate enforcement needed, admin can force user to re-login (delete user session via admin panel).

---

## Forcing Logout (Rare Case)

**Scenario:** User compromised, must revoke access immediately.

**Option 1: JWT Blacklist (Redis)**

```ts
// Blacklist JWT until expiration
await redis.set(`jwt:blacklist:${token.jti}`, '1', 'EX', token.exp - now);

// Middleware checks blacklist
const isBlacklisted = await redis.get(`jwt:blacklist:${token.jti}`);
if (isBlacklisted) return Response.redirect('/login');
```

**Pros:** Instant revocation
**Cons:** Requires Redis, defeats stateless benefit

**Option 2: Short token lifetime (30 min) + refresh token**

```ts
// JWT expires in 30 min, refresh token lasts 30 days
// If user compromised, delete refresh token from DB
// JWT expires in 30 min, user can't refresh → logged out
```

**Pros:** No Redis needed
**Cons:** 30 min delay

**Decision:** Start with Option 2 (simple). Add Redis blacklist in Phase 2+ if clients demand instant revocation.

---

## Security Measures

### httpOnly Cookie

```ts
// next-auth sets this automatically
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true, // JS can't read
      sameSite: 'lax', // CSRF protection
      path: '/',
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    },
  },
}
```

### Token Signing

```ts
// .env
AUTH_SECRET=<32-byte random string>

// Auth.js uses HMAC SHA-256 to sign JWT
// Attacker can't forge JWT without AUTH_SECRET
```

### Token Expiration

```ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Audit Logging (Optional — Phase 2)

```ts
// Log every auth event
async jwt({ token, user }) {
  if (user) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      }
    });
  }
  return token;
}
```

---

## Consequences

### Positive

1. **Fast:** 0 DB queries for auth checks (vs 500K/day with sessions)
2. **RSC-compatible:** `await auth()` works anywhere in server components
3. **Scalable:** Stateless auth scales horizontally without shared state
4. **Simple:** Auth.js handles all JWT logic (signing, verification, refresh)

### Negative

1. **Role changes delayed:** Up to 24h before new role takes effect (acceptable for infrequent admin actions)
2. **No instant revocation:** Compromised JWT valid until expiration (mitigated: httpOnly cookie, short expiration, refresh rotation)
3. **Token size:** ~500 bytes (vs 16 bytes session ID), but well under 4KB cookie limit

### Mitigation Strategies

**Role change delay:**
- Admin panel shows warning: "Role changes take effect within 24 hours or on next login"
- Admin can force user to re-login (send password reset email or disable/re-enable account)

**Compromised JWT:**
- Short expiration (30 min access token + 30 day refresh token in Phase 2)
- httpOnly cookie (can't be stolen via XSS)
- Refresh token rotation (new refresh token on every use, old one invalid)

---

## References

- [Auth.js Next.js 16 guide](https://authjs.dev/getting-started/installation?framework=next.js)
- [JWT vs Sessions debate](https://stackoverflow.com/questions/43452896/authentication-jwt-usage-vs-session)
- [Next.js App Router auth patterns](https://nextjs.org/docs/app/building-your-application/authentication)

---

## Review Schedule

**Review trigger:** Clients report "role changes don't take effect fast enough" OR security audit recommends instant revocation

**If triggered:**
- Add Redis JWT blacklist for instant revocation
- OR: Shorten token lifetime to 5 min (requires more frequent refresh)

**Expected:** JWT approach works for 2+ years without changes.
