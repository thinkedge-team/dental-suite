# ADR-004: WhatsApp Integration Strategy

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — WhatsApp reminder system for appointment notifications

---

## Context

Indonesian dental clinics communicate primarily via WhatsApp (70% of bookings from interviews). We need a WhatsApp integration for:
- Booking confirmations (instant after patient books)
- 1-day advance reminders
- 2-hour advance reminders (added from interview feedback)
- Cancellation confirmations

**Two approaches:**
1. **wa.me (click-to-chat links)** — free, manual send
2. **WhatsApp Business API** — automated, costs money, requires Meta approval

**Scale:**
- MVP: 5-10 clinics
- Year 1: 50 clinics × 500 appointments/month = 25K appointments/month
- Year 3: 500 clinics × 500 appointments/month = 250K appointments/month
- Each appointment = 3 WA messages (confirmation + 1-day + 2-hour) = 750K messages/month

---

## Decision

**MVP: wa.me click-to-chat (manual send by receptionist)**

**Phase 2+: Upgrade to WhatsApp Business API (automated) when 3+ clients request it**

---

## Alternatives Considered

### Option A: wa.me Click-to-Chat (Chosen for MVP)

**Architecture:**
- Patient books → system generates `wa.me` link with pre-filled message
- Receptionist sees "Reminders to Send" list in portal
- Clicks "Send Reminder" → opens WA Web with message ready
- Receptionist hits Send in WhatsApp (manual last step)

**Example link:**
```
https://wa.me/628123456789?text=Halo%20Dewi%2C%0A%0APengingat%3A%20Anda%20memiliki%20janji%20dengan%20dr.%20Andi%20besok%2C%2010%20September%202026%20pukul%2014%3A00%20di%20Klinik%20Kelapa%20Gading.%0A%0AJika%20tidak%20bisa%20hadir%2C%20batalkan%20via%3A%20https%3A%2F%2Fapp.thinkedge.id%2Fcancel%2F...
```

**Pros:**

1. **Free:** No WhatsApp conversation fees
2. **No approval needed:** Works immediately, no Meta Business approval process
3. **No infrastructure:** No webhook server, no BSP (Business Solution Provider) account
4. **Simple:** Just URL generation, no API calls
5. **Uses personal/business WA:** Clinic uses their existing WhatsApp number (patients already have it saved)
6. **No rate limits:** wa.me has no enforced rate limit (vs API 1000 messages/24h limit)

**Cons:**

1. **Manual work:** Receptionist must click link + hit Send (not fully automated)
2. **Reminders can be forgotten:** If receptionist forgets to send, patient doesn't get reminder
3. **No delivery tracking:** Can't confirm message was delivered/read
4. **No templates:** Message formatting limited (plain text only, no buttons)
5. **Scales poorly:** 50 appointments/day = 100 reminder clicks (1-day + 2-hour)

**Effort:** 2 days (URL generation + portal UI)

**Cost:** $0/month

**When it breaks down:** 100+ appointments/day per clinic = receptionist spends 30+ min/day clicking reminders (acceptable for MVP, automate in Phase 2)

---

### Option B: WhatsApp Business API (Phase 2+)

**Architecture:**
- Clinic signs up for WA Business API via BSP (Twilio, MessageBird, Qontak, Kanal, etc.)
- Think Edge integrates with BSP API
- Cron job runs hourly: finds appointments 24h or 2h away → sends WA message via API
- Fully automated (no receptionist action)

**BSP Options in Indonesia:**

| Provider | Setup | Cost | Approval Time |
|---|---|---|---|
| **Qontak** (local) | Easy, Indonesian support | IDR 500-1000/conversation | 1-2 weeks |
| **Kanal** (local) | Easy, Indonesian support | IDR 800-1200/conversation | 1-2 weeks |
| **Twilio** (global) | Complex, English docs | $0.005-0.015/message (IDR 75-225) | 1-2 weeks |
| **MessageBird** (global) | Medium complexity | €0.006-0.012/message (IDR 100-200) | 1-2 weeks |

**Meta approval requirements:**
- Registered business (clinic's NPWP/NIB)
- Facebook Business Manager account
- WhatsApp Business Account
- Display name verification
- Message template approval (each template takes 1-3 days)

**Message templates (must pre-approve):**

Template approval process:
1. Submit template to Meta: "Halo {{1}}, pengingat: Anda memiliki janji dengan {{2}} besok, {{3}} pukul {{4}}..."
2. Meta reviews (1-3 days)
3. If approved → can send
4. If rejected → resubmit with changes

**Pros:**

1. **Fully automated:** No receptionist action needed
2. **Delivery tracking:** API reports delivered/read/failed status
3. **Rich templates:** Buttons ("Cancel Appointment", "Reschedule"), media (clinic logo)
4. **Scalable:** 1000 appointments/day = 3000 messages sent automatically
5. **Professional:** Uses official WhatsApp Business verified badge

**Cons:**

1. **Cost:** 
   - 250K messages/month × IDR 800/message = IDR 200M/month (at Year 3 scale)
   - Or: pass cost to clinic (IDR 800/appointment = ~2% of IDR 300K consultation fee)
2. **Approval process:** 1-2 weeks setup, each template takes 1-3 days approval
3. **Meta dependency:** Meta can reject templates, suspend account (risk)
4. **Template rigidity:** Can't change message without re-approval (slow iteration)
5. **Rate limits:** 1000 messages/24h (tier 1), must request tier increase
6. **Infrastructure:** Need webhook server for delivery status callbacks

**Effort:** 1 week (BSP integration + template management + cron job + webhook handler)

**Cost (Year 3):** IDR 200M/month or $0.50/appointment passed to clinic

---

### Option C: Unofficial WA Gateway (Rejected)

**Architecture:**
- Third-party services (Fonnte, Wablas, WooWA) scrape WhatsApp Web
- API sends messages via browser automation (puppeteer-style)
- No Meta approval needed

**Examples:**
- Fonnte: IDR 100K-500K/month (unlimited messages)
- Wablas: IDR 200K/month (5000 messages)
- WooWA: IDR 150K/month (unlimited)

**Pros:**
- Cheap (flat fee, no per-message cost)
- No Meta approval
- Fast setup (5 minutes)

**Cons:**

1. **Against WhatsApp ToS:** Meta bans accounts using unofficial APIs (high risk)
2. **Unreliable:** Service goes down → all reminders fail
3. **No guaranteed delivery:** Messages often flagged as spam
4. **Account suspension risk:** Clinic's WhatsApp number gets banned
5. **Unprofessional:** "Sent via [Gateway Name]" footer in messages
6. **No support:** If service shuts down, no recourse

**Verdict:** Too risky. Clinic loses their WhatsApp number (main customer communication channel) if banned.

---

## Decision Matrix

| Criteria | wa.me (MVP) | WA Business API | Unofficial Gateway | Weight | Winner |
|---|---|---|---|---|---|
| **Time to implement** | ✅ 2 days | ⚠️ 1 week + 2 weeks approval | ✅ 1 day | 25% | wa.me |
| **Cost (Year 3)** | ✅ $0 | ❌ $12K/year | ✅ $1.2K/year | 20% | wa.me |
| **Scalability** | ⚠️ Manual (100 clicks/day) | ✅ Automated | ✅ Automated | 20% | API |
| **Reliability** | ✅ Clinic controls | ✅ Official API | ❌ Ban risk | 15% | wa.me/API |
| **Delivery tracking** | ❌ No | ✅ Yes | ⚠️ Limited | 10% | API |
| **Professional UX** | ⚠️ Plain text | ✅ Rich templates | ❌ Gateway watermark | 5% | API |
| **Compliance/Risk** | ✅ Safe | ✅ Official | ❌ ToS violation | 5% | wa.me/API |

**Weighted score:**
- wa.me (MVP): 85/100
- WA Business API (Phase 2): 75/100
- Unofficial Gateway: 45/100

---

## Implementation Plan

### MVP (Sprint 2): wa.me

**1. Generate reminder links:**

```ts
// lib/whatsapp.ts
export function generateReminderLink(appointment: Appointment, type: '1day' | '2hour'): string {
  const phone = appointment.patient.phone.replace(/\D/g, ''); // Remove non-digits
  
  const message = type === '1day' 
    ? `Halo ${appointment.patient.name},

Pengingat: Anda memiliki janji dengan ${appointment.doctor.name} besok, ${formatDate(appointment.scheduledAt)} pukul ${formatTime(appointment.scheduledAt)} di ${appointment.branch.name}.

Alamat: ${appointment.branch.address}

Jika tidak bisa hadir, batalkan via: ${getCancelUrl(appointment)}

Terima kasih!
${appointment.branch.organization.name}`
    : `Halo ${appointment.patient.name},

Pengingat: Janji Anda dengan ${appointment.doctor.name} HARI INI pukul ${formatTime(appointment.scheduledAt)} di ${appointment.branch.name}.

Kami tunggu kedatangan Anda!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
```

**2. Receptionist portal UI:**

```tsx
// app/(portal)/reminders/page.tsx
export default async function RemindersPage() {
  const reminders = await getRemindersToSend(); // Appointments 24h or 2h away, reminder not sent yet
  
  return (
    <div>
      <h1>Pengingat Perlu Dikirim ({reminders.length})</h1>
      {reminders.map(r => (
        <div key={r.id}>
          <p>{r.patient.name} - {r.scheduledAt} dengan {r.doctor.name}</p>
          <a 
            href={generateReminderLink(r, r.reminderType)} 
            target="_blank"
            onClick={() => markReminderSent(r.id)}
          >
            Kirim Pengingat via WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}
```

**3. Mark reminder sent:**

```ts
// actions/reminders.ts
export async function markReminderSent(appointmentId: string) {
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { 
      reminderSentAt: new Date(),
      reminderSentBy: session.user.id 
    }
  });
}
```

**Receptionist workflow:**
1. Opens `/portal/reminders` page (shows badge count in sidebar)
2. Sees list of reminders to send
3. Clicks "Kirim Pengingat" → WA Web opens in new tab
4. Reviews message, hits Send in WhatsApp
5. Closes tab, reminder marked as sent (badge count decreases)

**Limitations:**
- Receptionist must remember to check reminders page daily
- If receptionist forgets, patient doesn't get reminder
- No automation

---

### Phase 2: WhatsApp Business API

**Trigger:** 3+ clients request automated reminders OR clinic has 100+ appointments/day

**Setup steps:**

1. **Client gets WA Business API access:**
   - Clinic signs up with BSP (Qontak recommended for Indonesian clinics)
   - Meta approval process (1-2 weeks)
   - Think Edge gets API credentials from clinic

2. **Think Edge integrates BSP:**
   ```ts
   // lib/whatsapp-api.ts
   export async function sendWhatsAppMessage(phone: string, templateName: string, params: string[]) {
     const response = await fetch('https://api.qontak.com/v1/messages', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.QONTAK_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         to: phone,
         type: 'template',
         template: {
           name: templateName,
           language: { code: 'id' },
           components: [
             {
               type: 'body',
               parameters: params.map(p => ({ type: 'text', text: p }))
             }
           ]
         }
       })
     });
     return response.json();
   }
   ```

3. **Cron job sends reminders:**
   ```ts
   // cron/send-reminders.ts
   export async function sendScheduledReminders() {
     // Find appointments 24h away, reminder not sent
     const oneDayReminders = await prisma.appointment.findMany({
       where: {
         scheduledAt: {
           gte: addHours(new Date(), 23),
           lte: addHours(new Date(), 25)
         },
         reminderSentAt: null
       }
     });
     
     for (const appt of oneDayReminders) {
       await sendWhatsAppMessage(
         appt.patient.phone,
         'appointment_reminder_1day',
         [appt.patient.name, appt.doctor.name, formatDate(appt.scheduledAt), formatTime(appt.scheduledAt)]
       );
       await markReminderSent(appt.id);
     }
     
     // Same for 2-hour reminders
   }
   ```

4. **Run cron every hour:**
   - Vercel Cron (free tier: 1 cron job)
   - OR external cron service (EasyCron, cron-job.org)

**Cost breakdown (example clinic):**
- 500 appointments/month × 3 messages = 1500 messages
- 1500 × IDR 800 = IDR 1.2M/month (~$80/month)
- Clinic pays: add IDR 2400/appointment to booking fee (negligible)

**Upgrade path from wa.me:**
- wa.me links stay available (fallback if API fails)
- Feature flag per org: `useWhatsAppAPI: boolean`
- If `true` → cron sends automatically
- If `false` → receptionist uses wa.me links (MVP flow)

---

## Cost Analysis

### wa.me (MVP):

| Item | Cost |
|---|---|
| Development | $0 (2 days in Sprint 2, already budgeted) |
| Infrastructure | $0 (no API, no webhooks) |
| Per-message cost | $0 |
| **Total Year 1** | **$0** |

### WhatsApp Business API (Phase 2):

| Item | Cost |
|---|---|
| Development (one-time) | ~$2000 (1 week engineer time) |
| BSP account setup | $0 (clinic pays) |
| Per-message cost | IDR 800 (~$0.05) |
| 250K messages/month (Year 3) | IDR 200M/month (~$12K/month) |
| **Total Year 1** | **$2K setup + passed to clinic** |
| **Total Year 3** | **$144K/year (passed to clinic as IDR 2400/appointment)** |

**Passed to clinic:**
- Clinic charges patient IDR 300K/consultation
- Add IDR 2400 WA cost (~0.8% markup)
- Patient pays IDR 302,400 — acceptable

**Alternative:** Think Edge absorbs cost, increases SaaS fee from IDR 1.5M → 2M/month per clinic (+33%). Clinic prefers pay-per-message (scales with usage).

---

## Consequences

### Positive (wa.me MVP)

1. **Zero cost:** No ongoing expense
2. **Fast implementation:** Ships in Sprint 2 (no delay)
3. **No vendor lock-in:** Not tied to specific BSP
4. **Clinic controls:** Uses their existing WA number (patients trust it)
5. **Low risk:** Can't get banned (official wa.me feature)

### Negative (wa.me MVP)

1. **Manual work:** Receptionist must send reminders (not fully automated)
2. **Scales poorly:** 100+ appointments/day = 30 min/day clicking
3. **No tracking:** Can't confirm delivery/read status

### Mitigation (Phase 2 Upgrade)

**When to upgrade:**
- Clinic hits 100+ appointments/day (receptionist overwhelmed)
- Clinic explicitly requests automation
- 3+ clients request it (worth building integration)

**Upgrade is optional:** Clinics can stay on wa.me indefinitely if they prefer (no cost).

---

## References

- [WhatsApp Business API pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [Qontak WhatsApp Business API](https://qontak.com/whatsapp-business-api/)
- [wa.me link format](https://faq.whatsapp.com/5913398998672934/)
- [Meta template approval process](https://developers.facebook.com/docs/whatsapp/message-templates)

---

## Review Schedule

**Review trigger:** 3 clients request automated reminders OR receptionist feedback: "clicking reminders takes too long"

**If triggered:**
- Get quotes from 3 BSPs (Qontak, Kanal, Twilio)
- Estimate cost per clinic (monthly message volume)
- Build Phase 2 integration (~1 week sprint)

**Expected:** wa.me works for Year 1 (5-50 clinics), upgrade in Year 2 when scale demands it.
