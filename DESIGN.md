# DESIGN.md — Think Edge Dental Suite (Public Patient Web)

## 0. Research & Taste Formulation
- **Taste Direction**: Clinical Luxury & Modern Editorial (`soft-skill` + `linear.app`/`stripe` polish).
- **Core Purpose**: Build patient trust instantly, communicate clinical precision without cold sterile intimidation, provide seamless discovery, and maximize WhatsApp/booking conversion.
- **Audience**: Urban families, professionals, and cosmetic dentistry patients seeking high-standard care in Kelapa Gading and Pluit, Jakarta.

## 1. Color Palette & Lighting
- **Paper**: `oklch(0.96 0.005 90)` (#f7f5f0) — Warm, reassuring canvas.
- **Ink**: `oklch(0.15 0.01 100)` (#161817) — Deep contrast for razor-sharp typography.
- **Primary Orange**: `oklch(0.67 0.17 45)` (#f38218) — Vibrant signature accent for badges and primary CTAs.
- **Card Surface**: Pure White with subtle warm tint (`#ffffff`), `border border-border/70` with micro glassmorphism.
- **Emerald Accent**: `oklch(0.65 0.18 150)` for instant WhatsApp action, Kemenkes verification, and Cashless badges.
- **Gradients**: Radial glowing soft blobs (`bg-primary/5 blur-3xl`) to create depth behind hero sections.

## 2. Typography
- **Strictly Sans-serif**: `Plus_Jakarta_Sans` exclusively across all weights (300, 400, 500, 600, 700).
- **Hero Title**: Ultra clean `tracking-tight leading-[1.12]`, mixing `font-light` with bold punch phrases.
- **Labels**: Uppercase micro-copy `text-[10px]` or `text-[11px]` with `tracking-widest font-semibold`.

## 3. Motion & Micro-Interactions
- **Transitions**: Standardized `duration-300 ease-out` or `duration-500` for image scale.
- **Card Hovers**: `-translate-y-1.5`, soft elevation `shadow-xl shadow-black/5`, dynamic border glow `border-primary/40`.
- **Button Affordance**: Hover scale `hover:scale-[1.02] active:scale-[0.98]`.
- **Interactive Badges**: Pulsing emerald indicator dots on WhatsApp live triggers.
- **FAQ Expanders**: Smooth disclosure transitions.

## 4. Layout Architecture
- **Homepage Structure**:
  1. Hero section with glowing ambient backdrop, credential badge, bold typography, and interactive booking trigger.
  2. Quick Trust Metrics Bento: 4 interconnected stats (Cabang, Dokter Spesialis, Rekam Medis Digital, Mitra Asuransi).
  3. Featured Treatments Showcase: Grid cards with imagery, price tag, duration, and direct procedure links.
  4. Clinical Excellence / Why Us: 3-pillar visual bento grid (Sterilisasi Kelas B, Intraoral 3D Scanner, Zero-Queue Scheduling).
  5. Meet Our Specialist Doctors: Carousel/grid with portraits and schedule previews.
  6. Dual-Branch Locations Spotlight: Kelapa Gading & Pluit interactive preview with maps & hours.
  7. Insurance & Cashless Payment Banner: Logos with instant reassurance.
  8. Patient Journey / 4 Steps Consultation Guide.
  9. High-converting CTA Banner: "Wujudkan Senyum Sehat Bersama Kami".
