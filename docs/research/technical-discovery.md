# Technical Discovery — Existing Clinic Technology Landscape

> **Phase 1.4 Deliverable**
> Understanding the technical constraints, existing systems, and integration requirements at target Indonesian dental clinics.

---

## Purpose

Before designing Think Edge Dental Suite, we need to understand:
- What systems clinics already use (and whether we need to integrate or replace them)
- Network/device constraints that affect UX decisions (offline-first? mobile-first?)
- Integration opportunities (WhatsApp API, accounting software, biometric devices)
- Technical literacy level (affects onboarding complexity)

**Data collection method:** Interview 3-5 clinic directors + branch managers, ask about their current tech stack + observe receptionist workstations during shadowing sessions.

---

## Discovery Questionnaire (for Director/Manager Interviews)

### Current Software Landscape

**Q1. What software do you currently use for running the clinic?**
- [ ] Practice management / HIS (name: ____________)
- [ ] Accounting software (Jurnal.id, Accurate, Xero, other: ________)
- [ ] CRM / patient database (name: ____________)
- [ ] Website (who built it? WordPress, custom, freelancer?)
- [ ] Social media management (manual, scheduled tool?)
- [ ] Inventory tracking (Excel, dedicated app?)
- [ ] Staff attendance (fingerprint device brand: ________, manual logbook?)
- [ ] Nothing — all manual / Excel / paper

**Q2. For booking/scheduling, what do you use today?**
- [ ] Paper appointment book
- [ ] Excel spreadsheet (shared? local file? Google Sheets?)
- [ ] WhatsApp coordination (receptionist checks with doctor via WA before confirming)
- [ ] Google Calendar (shared calendar per doctor?)
- [ ] Practice management software (which one: ________)
- [ ] Other: __________

**Q3. How do patients contact you to book?**
- [ ] Phone call (primary)
- [ ] WhatsApp (personal number or business number?)
- [ ] Walk-in only
- [ ] Instagram DM
- [ ] Website form (if yes — goes where? email? WA?)
- [ ] Other: __________

---

### Network & Infrastructure

**Q4. What internet connection do you have at each branch?**
- Provider: ____________ (IndiHome, Biznet, Oxygen, other)
- Speed: ________ Mbps
- Reliability: ☐ Very stable ☐ Occasional drops ☐ Frequently unstable
- Backup connection: ☐ Mobile hotspot ☐ Secondary ISP ☐ None

**Q5. If internet goes down, what happens to the clinic operations?**
- [ ] Completely stuck — can't access schedules or patient records
- [ ] Have paper backup, can operate but data entry is delayed
- [ ] Unaffected — everything is offline/paper already
- [ ] Other: __________

**MVP consideration:** If internet is unreliable, should Think Edge support offline-first mode, or is reliable internet a prerequisite for using the platform?

---

### Device Landscape

**Q6. What devices do receptionists use for daily work?**
- [ ] Windows PC/laptop
- [ ] Mac
- [ ] Android tablet (brand/model: ________)
- [ ] iPad
- [ ] Smartphone only (Android / iOS)
- [ ] Nothing — paper-based

**Q7. What devices do doctors use?**
- [ ] Shared PC at clinic
- [ ] Personal laptop
- [ ] Tablet
- [ ] Smartphone only
- [ ] Don't use any device for clinical work

**Q8. Would receptionists/doctors be comfortable using a web application (browser-based), or do they strongly prefer mobile apps?**
- [ ] Web is fine
- [ ] Prefer mobile app (Android / iOS / both)
- [ ] Depends on the task: ________

**MVP consideration:** Next.js web app works on all devices. Mobile app (React Native) can be Phase 2+ if demand justifies it.

---

### Integration Opportunities

#### Accounting Software

**Q9. Do you use accounting software? If yes, what integration would be valuable?**
- Software used: ____________
- Integration need:
  - [ ] Auto-sync daily revenue from appointments → accounting
  - [ ] Export invoice data weekly (CSV acceptable? Or API?)
  - [ ] Not needed — manual entry is fine

**Common Indonesian SMB accounting tools:**
- Jurnal.id (cloud, popular for SMB)
- Accurate Online
- Zahir Accounting
- Excel (manual)

**MVP decision:** CSV export acceptable for MVP. Phase 2+ can add Jurnal.id API if demand is strong.

---

#### WhatsApp Business API

**Q10. Do you currently use WhatsApp Business (not personal WA)?**
- [ ] Yes — official WhatsApp Business app (free, limited features)
- [ ] Yes — WhatsApp Business API via provider (which provider: ________)
- [ ] No — using personal WhatsApp
- [ ] No — don't use WhatsApp at all

**Q11. If you use unofficial gateways (like WA Web scrapers, third-party WA APIs), which one?**
- Examples: Fonnte, Wablas, Woowa, WA Rotator
- Cost: IDR ________ per month
- Why did you choose unofficial over official API?
  - [ ] Cheaper
  - [ ] Easier setup (no Meta approval process)
  - [ ] Don't know official API exists
  - [ ] Other: __________

**WhatsApp Business API landscape (2024-2026):**

| Option | Cost | Approval Required | Features | Risk |
|---|---|---|---|---|
| **Personal WA** (consumer app) | Free | No | Manual messaging only | ⚠️ Can be banned if used commercially |
| **WA Business App** (official free app) | Free | No | Labels, quick replies, 1 device only | ⚠️ Limited — can't automate, single user |
| **WA Business API** (official, via Meta BSP) | ~IDR 500-1000 per conversation | Yes (Meta approval) | Automation, multi-agent, integrations | ✅ Compliant, scalable |
| **Unofficial gateways** (scrapers, third-party) | IDR 100-500K/month | No | Automation, easy setup | ⚠️ Can be banned anytime, unreliable |

**MVP decision (from PROJECT_PLAN.md ADR-004):**
- **MVP:** `wa.me` click-to-chat links (patient clicks link → opens WA with pre-filled message → receptionist responds manually)
  - Cost: free
  - No approval needed
  - Works immediately
  - Limitation: not automated, receptionist must send reminders manually

- **Phase 2+:** WA Business API integration (if clinic already has API access or willing to apply)
  - Requires Meta BSP account (Twilio, MessageBird, Vonage, or local Indonesian providers like Qontak, Kanal, Botika)
  - Automated reminders
  - Template messages pre-approved by Meta

**Q12. Would your clinic be willing to go through the Meta Business API approval process (takes 1-2 weeks) to enable automated reminders?**
- [ ] Yes, if it saves receptionist time
- [ ] Maybe, depends on cost
- [ ] No, too complicated
- [ ] We already have it (provider: ________)

---

#### Biometric / Fingerprint Attendance

**Q13. Do you use fingerprint/face recognition devices for staff attendance?**
- [ ] Yes (brand/model: ________)
- [ ] No — manual logbook or Excel

**Q14. If yes, how do you access the attendance data?**
- [ ] USB export to Excel
- [ ] Device has its own software/web portal
- [ ] Manual — staff signs in on the device, manager reads it from the screen
- [ ] Other: __________

**Q15. Would you want Think Edge to sync attendance data from your device, or is manual entry acceptable?**
- [ ] Sync via API/SDK (if available)
- [ ] CSV import weekly is fine
- [ ] Manual entry is fine — device is just for audit proof
- [ ] We don't care about digital attendance tracking

**Common Indonesian biometric devices:**
- Solution (P207, X100-C, etc.) — popular low-cost brand
- Fingerspot (Revo series)
- ZKTeco (Chinese brand, common in SEA)
- Anviz
- Custom Android tablet apps

**MVP decision:** Manual attendance entry for MVP (staff logs in/out via Think Edge portal). Phase 2+ can add device integration if there's a common SDK/API (most devices support CSV export at minimum).

---

#### Insurance Partner Portals

**Q16. How do you currently submit insurance claims (BPJS or private)?**
- [ ] Manual — fill PDF form, email to insurance
- [ ] Insurance company portal (login, upload docs)
- [ ] Phone/fax (rare but some clinics still do this)
- [ ] Third-party billing service
- [ ] We don't accept insurance

**Q17. If you use an insurance portal, does it have an API, or is it web-only?**
- [ ] Web-only (manual upload)
- [ ] Has API (we use it via: ________)
- [ ] Don't know
- [ ] Not applicable

**MVP decision (from regulatory.md):** 
- Display accepted insurance partners on website (GROW)
- Track patient's insurance at booking (CONNECT)
- Claim submission: **manual/out of scope** for MVP (no standard API exists in Indonesia)

---

## Expected Technical Constraints (Hypotheses to Validate)

| Constraint | Impact on MVP | Validation Needed |
|---|---|---|
| **Low technical literacy** | Onboarding wizard must be dead simple, tooltips everywhere | Test with receptionist during shadowing |
| **Unreliable internet** | Auto-save drafts, graceful offline handling, avoid long-polling | Ask about internet drops in Q4-5 |
| **Mixed devices** (PC + tablet + phone) | Responsive design mandatory, mobile-first UI | Observe during shadowing (Q6-8) |
| **Manual processes deeply ingrained** | Change management needed — staff may resist "yet another system" | Gauge in interviews: "Have you tried software before and stopped using it?" |
| **Cost-sensitive** | Free tier or very low entry price critical | Competitive analysis already confirms IDR 1-3M/month ceiling |
| **WA is king** | Any solution that doesn't integrate WA will fail | Q10-12 validates this |
| **No standardized integrations** | Can't rely on API integrations (accounting, insurance, biometric) — must support CSV import/export | Q9, Q14-17 validate |

---

## Expected Findings Template (to be filled after interviews)

### Software Currently in Use

**Most common tools by category:**
- Practice management: _[Pending interviews — hypothesis: Klinik+, Simpus, or nothing]_
- Accounting: _[Hypothesis: Jurnal.id or Excel]_
- Booking: _[Hypothesis: Excel + WhatsApp, or paper]_
- Website: _[Hypothesis: WordPress from freelancer, or none]_
- Attendance: _[Hypothesis: Fingerprint device (Solution/Fingerspot) or manual]_

### Network Reliability

- **Average internet speed:** _[Pending]_
- **Frequency of outages:** _[Pending — hypothesis: weekly drops at smaller clinics]_
- **Backup strategy:** _[Hypothesis: mobile hotspot backup, or just wait for internet to return]_

### Device Breakdown

- **Receptionist primary device:** _[Hypothesis: Windows PC 70%, Android tablet 20%, phone only 10%]_
- **Doctor device usage:** _[Hypothesis: minimal — most don't use devices during clinical work]_

### Integration Willingness

- **Accounting software sync:** _[Hypothesis: CSV export acceptable, API nice-to-have]_
- **WA Business API:** _[Hypothesis: 30% already use unofficial gateways, 50% willing to try official API if easy, 20% prefer manual]_
- **Biometric device sync:** _[Hypothesis: low priority — manual entry acceptable if it's quick]_

### Biggest Technical Barriers

1. _[Pending — hypothesis: fear that staff won't adopt it]_
2. _[Hypothesis: worry about data loss if system goes down]_
3. _[Hypothesis: integration with existing accounting workflow]_

---

## Integration Priority Matrix (after interviews)

| Integration | Business Value | Technical Complexity | MVP Priority |
|---|---|---|---|
| WhatsApp (wa.me click-to-chat) | High — patient communication is 90% WA | Low — just URL generation | ✅ MVP |
| WhatsApp Business API | High — automated reminders save 1-2 hours/day | Medium — requires Meta BSP setup | ⬜ Phase 2 |
| Jurnal.id accounting export | Medium — saves 30 min/week | Medium — API integration | ⬜ Phase 2 |
| CSV import/export (generic) | Medium — manual workaround for all integrations | Low — standard CSV format | ✅ MVP |
| Biometric attendance sync | Low — nice to have, not critical | High — device-specific SDK | ⬜ Phase 3 |
| BPJS claim API | Low — no API exists yet | N/A | ⬜ Out of scope |
| Google Business Profile API | Medium — SEO value | Medium — requires Google My Business API | ⬜ Phase 2 |

---

## Technical Decisions from Discovery

### Must Support (MVP)

- [x] **Responsive web app** (works on PC, tablet, phone) — Next.js handles this
- [x] **wa.me integration** — simple URL generation
- [x] **CSV export** for reports/data portability
- [ ] **Graceful offline handling** — forms save to localStorage before submit (if internet drops during booking)
- [ ] **Low-bandwidth mode** — optimize images, lazy-load non-critical assets
- [ ] **Bahasa Indonesia UI** — primary language, English admin labels acceptable

### Nice to Have (Phase 2+)

- [ ] WhatsApp Business API integration (conditional on clinic having BSP access)
- [ ] Jurnal.id API sync
- [ ] Mobile app (React Native) if web app proves insufficient on mobile devices
- [ ] Progressive Web App (PWA) for offline appointment viewing

### Out of Scope

- ❌ Native desktop app (Electron) — web app is sufficient
- ❌ SMS reminders — WA dominates in Indonesia, SMS is dead
- ❌ Biometric device SDKs — too fragmented, CSV import acceptable
- ❌ BPJS/insurance claim APIs — don't exist

---

## Risk Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| **Internet drops during booking** | Medium | Auto-save form data to localStorage, retry on reconnect |
| **Staff resist new system** (prefer Excel/paper) | High | Onboarding wizard + training videos + phone support first 2 weeks |
| **WhatsApp gets banned** (if clinic uses unofficial gateway) | Low (for official wa.me links) | Use official wa.me only in MVP — no scraping |
| **Device compatibility issues** (old browsers, old Android) | Low | Target modern browsers (Chrome/Edge/Safari last 2 versions), graceful degradation |
| **Clinic can't afford IDR 1-3M/month** | Medium | Freemium tier (GROW only, free) gets them in the door |

---

## Next Steps After Interviews

1. **Confirm hypotheses:**
   - Is Excel + WA really the dominant workflow?
   - How bad is internet reliability in practice?
   - Do clinics actually want integrations, or is CSV export enough?

2. **Update ADR-004 (WhatsApp decision)** with interview findings

3. **Add to devops.md (Phase 3.5):**
   - Offline-first requirements (if validated)
   - Bandwidth optimization checklist
   - Device testing matrix (browsers, screen sizes)

4. **Feed into Phase 2 UX Direction:**
   - If tablets are common → optimize for tablet form factor
   - If internet is flaky → add "saving..." indicators, auto-save
   - If technical literacy is low → add contextual help, tooltips, onboarding wizard

---

## Interview Scheduling

**Target contacts:**
- [ ] 3 clinic directors (different sizes: 3 branches, 5 branches, 10+ branches)
- [ ] 2 branch managers (get ground truth on daily tech frustrations)
- [ ] 2 receptionist shadowing sessions (see what devices/software they actually touch)

**Timeline:** Complete interviews within 2 weeks of Phase 1 kickoff.

---

## References

- WhatsApp Business API pricing: [developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- Indonesian BSP providers: Qontak, Kanal, Botika, Twilio, MessageBird
- Jurnal.id API: [jurnal.id/api](https://www.jurnal.id/)
- Common Indonesian SMB software: Jurnal, Accurate, Moka (retail POS), Hadirr (HR/attendance)
