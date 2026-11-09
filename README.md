# EduQuest Mock Test Portal (ST & HCIE 2026-27)

A production-ready, fully responsive mock-test portal built for **EduQuest** (Reimagining Education) to prepare students for official competitive events:
- **Surgical Technologist (ST)**
- **Healthcare Issues Exam (HCIE)**

---

## 1. Key Features & Exam Fidelity

### 🩺 Surgical Technologist (ST)
- **Round One Written Exam**: 50 MCQs, 60 minutes countdown, 4 options (A–D).
- **Official 6-Category Blueprint Weighting**:
  1. *Profession of CST* (10% = 5 questions) — AST Ch. 1
  2. *Physical Environment & Safety Standards* (10% = 5 questions) — AST Ch. 4
  3. *Surgical Asepsis & Sterility* (20% = 10 questions) — AST Ch. 7
  4. *Instrumentation, Equipment & Supplies* (30% = 15 questions) — AST Ch. 10 & Nemitz
  5. *Hemostasis, Wound Healing & Wound Closure* (10% = 5 questions) — AST Ch. 11
  6. *Surgical Anatomy & Physiology* (20% = 10 questions) — AST Ch. 16
- **Answer-Sheet Simulation**: OMR bubble-sheet alongside question view with touch-friendly mobile drawer.
- **Plain Countdown Clock**: Real HOSA test conditions (no verbal time warnings; auto-submit at 0:00).
- **Round Two Clinical Skills Evaluator**: Built-in rubric calculator for Skills II–VI with live 70% mastery threshold calculation (104.3 / 149 pts).

### 📰 Healthcare Issues Exam (HCIE)
- **Fact-Recall Questions**: Pulled from designated health journalism sources (*MedicalNewsToday*, *Johns Hopkins Public Health*, *ScienceDaily*, *Healthline*) published within the official test window.
- **Tiebreaker Essay**: Built-in 500-word prompt panel with live word counter, evaluated by Admin on position, named source citations, structure, and grammar.

### 🛡️ Ironclad Security & Anti-Cheating Architecture
1. **Separation of Stems & Answers**: The `questions` table contains **zero** correct answers, scoring weights, or explanations. Students query only question stems and choices.
2. **Locked `question_keys`**: Isolated table with Postgres RLS blocking all student queries. Accessible strictly server-side by the elevated service role during submission.
3. **Database Authorization**: Admin privileges verified via Postgres security definer function `is_admin()`, never via client-side strings.
4. **Draft Autosave & Offline Resilience**: Dual-layer autosave (instant `localStorage` + debounced server sync) protects student responses against connectivity drops.

---

## 2. Quick Start & Setup Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` and add your credentials:
```bash
cp .env.example .env.local
```
Key variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Public Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Secret Service Role Key (server-only)
- `ADMIN_EMAIL`: `rupali.eduquest@gmail.com`
- `ADMIN_INITIAL_PASSWORD`: Secure initial password for Admin
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `465` (or `587`)
- `SMTP_USER`: `rupali.eduquest@gmail.com`
- `SMTP_PASS`: Your Gmail App Password

### Step 3: Run the Database Schema in Supabase
1. Open your Supabase Dashboard: **https://supabase.com/dashboard/project/YOUR_PROJECT_ID**
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
*(This creates all tables, indexes, security-definer functions, triggers, and RLS policies).*

### Step 4: Seed the Admin Account & Mock Tests
Run the one-time admin seeder script:
```bash
npm run seed:admin
```
*(Sets `rupali.eduquest@gmail.com` with `role='admin'` and `status='approved'`)*.

Run the test seeder to create official mocks and categories:
```bash
npm run seed:tests
```

### Step 5: Start the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. User Roles & Access Workflow

| Role | Access Permissions |
|---|---|
| **Visitor** | Can view landing page, test catalog (with Free/Locked badges), and exam blueprints. Cannot take tests. |
| **Pending Student** | Can take the **Free ST Mock Test** immediately. All other mocks display a lock banner ("Pending Admin Approval"). |
| **Approved Student** | Unlocks all published mocks, practice sets, and detailed reports. |
| **Admin** (`rupali.eduquest@gmail.com`) | Complete management: Approve/Reject applicants with email notifications, per-test overrides matrix, question JSON imports, ST skills grading, and email delivery audit log. |

---

## 4. SMTP Transactional Email Notifications
Dispatched via Nodemailer SMTP and logged to `public.email_log`:
1. **New Student Signup** &rarr; Admin alert sent to `rupali.eduquest@gmail.com` with applicant details (name, email, phone, city, events).
2. **Admin Accept Decision** &rarr; Welcome email sent to student confirming all mocks are unlocked.
3. **Admin Reject Decision** &rarr; Polite email sent with optional notes.
4. **Mock Submission** &rarr; Report ready notification sent to student with score summary and link to A4 PDF view.

---

## 5. Production Build & Deployment to Vercel

```bash
npm run build
```

When deploying to [Vercel](https://vercel.com):
1. Import this repository.
2. Under **Project Settings &rarr; Environment Variables**, paste all keys from your `.env.local`.
3. Set Framework Preset to **Next.js**.
4. Click **Deploy**.

