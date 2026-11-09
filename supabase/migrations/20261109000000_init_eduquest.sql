-- Supabase Migration: 20261109000000_init_eduquest.sql
-- Direct copy of supabase/schema.sql for Supabase CLI migrations

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Drop existing triggers if re-running
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();
drop function if exists public.can_access_test(uuid);

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  events text[] not null default '{}',
  role text not null default 'student' check (role in ('student', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_email on public.profiles(email);

-- 4. TESTS TABLE
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  event text not null check (event in ('ST', 'HCIE')),
  kind text not null default 'mock' check (kind in ('mock', 'practice')),
  duration_min int not null default 60,
  total_questions int not null default 50,
  is_free boolean not null default false,
  is_published boolean not null default false,
  instructions text,
  marking jsonb not null default '{"marks_correct": 1, "marks_wrong": 0, "marks_unanswered": 0, "pass_percent": 70}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tests_event on public.tests(event);
create index if not exists idx_tests_published_free on public.tests(is_published, is_free);

-- 5. SECTIONS TABLE
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  name text not null,
  weight_percent numeric(5,2) not null default 0,
  question_count int not null default 0,
  sort_order int not null default 0
);

create index if not exists idx_sections_test_id on public.sections(test_id);

-- 6. QUESTIONS TABLE (ZERO ANSWERS OR EXPLANATIONS STORED HERE)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  type text not null default 'mcq_single' check (type in ('mcq_single', 'image_mcq', 'short_text', 'essay', 'mcq_multi')),
  stem text not null,
  image_url text,
  options jsonb not null default '[]'::jsonb,
  topic text,
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  source_ref text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_test_id on public.questions(test_id);
create index if not exists idx_questions_section_id on public.questions(section_id);

-- 7. QUESTION_KEYS TABLE (SECURITY-LOCKED: ONLY SERVICE-ROLE & ADMIN)
create table if not exists public.question_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct jsonb not null,
  accepted_answers text[] default '{}',
  explanation text,
  source_url text
);

-- 8. TEST_ACCESS OVERRIDES TABLE
create table if not exists public.test_access (
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, test_id)
);

create index if not exists idx_test_access_user on public.test_access(user_id);

-- 9. ATTEMPTS TABLE
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_sec int default 0,
  score numeric(6,2) default 0,
  max_score numeric(6,2) default 0,
  percent numeric(5,2) default 0,
  section_scores jsonb default '{}'::jsonb,
  answers_draft jsonb default '{}'::jsonb,
  essay_text text,
  client_meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_attempts_user_id on public.attempts(user_id);
create index if not exists idx_attempts_test_id on public.attempts(test_id);
create index if not exists idx_attempts_status on public.attempts(status);

-- 10. ATTEMPT_ANSWERS TABLE
create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected jsonb default '[]'::jsonb,
  text_answer text,
  is_correct boolean,
  marks numeric(5,2) default 0,
  time_spent_sec int default 0,
  flagged boolean default false,
  correct_snapshot jsonb,
  explanation_snapshot text,
  created_at timestamptz not null default now()
);

create index if not exists idx_attempt_answers_attempt on public.attempt_answers(attempt_id);

-- 11. ACCESS_REQUESTS TABLE
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles(id),
  note text
);

create index if not exists idx_access_requests_status on public.access_requests(status);
create index if not exists idx_access_requests_user on public.access_requests(user_id);

-- 12. EMAIL_LOG TABLE
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

-- 13. ST ROUND TWO SKILLS PRACTICE TABLE
create table if not exists public.st_skills_practice (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id text not null,
  scores jsonb not null default '{}'::jsonb,
  total_score numeric(5,2) not null default 0,
  max_score numeric(5,2) not null default 0,
  mastery_achieved boolean not null default false,
  notes text,
  evaluated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_st_skills_user on public.st_skills_practice(user_id);

-- HELPER FUNCTIONS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.can_access_test(p_test_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_is_free boolean;
  v_is_published boolean;
  v_user_status text;
  v_has_override boolean;
begin
  if public.is_admin() then
    return true;
  end if;

  if auth.uid() is null then
    return false;
  end if;

  select is_free, is_published into v_is_free, v_is_published
  from public.tests
  where id = p_test_id;

  if not found or not v_is_published then
    return false;
  end if;

  if v_is_free then
    return true;
  end if;

  select status into v_user_status
  from public.profiles
  where id = auth.uid();

  if v_user_status = 'approved' then
    return true;
  end if;

  select exists (
    select 1 from public.test_access
    where user_id = auth.uid() and test_id = p_test_id
  ) into v_has_override;

  return v_has_override;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_phone text;
  v_city text;
  v_events text[];
  v_role text := 'student';
  v_status text := 'pending';
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', 'Student');
  v_phone := coalesce(new.raw_user_meta_data->>'phone', '');
  v_city := coalesce(new.raw_user_meta_data->>'city', '');
  
  if new.raw_user_meta_data ? 'events' then
    select array_agg(elem::text) into v_events
    from jsonb_array_elements_text(new.raw_user_meta_data->'events') as elem;
  else
    v_events := array['ST'::text];
  end if;

  if lower(new.email) = 'rupali.eduquest@gmail.com' then
    v_role := 'admin';
    v_status := 'approved';
  end if;

  insert into public.profiles (id, full_name, email, phone, city, events, role, status)
  values (new.id, v_full_name, new.email, v_phone, v_city, coalesce(v_events, '{}'::text[]), v_role, v_status)
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    city = excluded.city,
    events = excluded.events;

  if v_role = 'student' then
    insert into public.access_requests (user_id, status)
    values (new.id, 'pending')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.tests enable row level security;
alter table public.sections enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.test_access enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.access_requests enable row level security;
alter table public.email_log enable row level security;
alter table public.st_skills_practice enable row level security;

-- POLICIES
create policy "Users can view own profile or admin can view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

create policy "Users can update own details (excluding role/status) or admin can update all"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin() or (
      auth.uid() = id and 
      role = (select role from public.profiles where id = auth.uid()) and
      status = (select status from public.profiles where id = auth.uid())
    )
  );

create policy "Only admin can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

create policy "Anyone can view published tests they have access to"
  on public.tests for select
  using (public.is_admin() or (is_published = true and (is_free = true or public.can_access_test(id))));

create policy "Admin can insert tests"
  on public.tests for insert
  with check (public.is_admin());

create policy "Admin can update tests"
  on public.tests for update
  using (public.is_admin());

create policy "Admin can delete tests"
  on public.tests for delete
  using (public.is_admin());

create policy "Users can view sections for accessible tests"
  on public.sections for select
  using (public.is_admin() or public.can_access_test(test_id));

create policy "Admin can insert sections"
  on public.sections for insert
  with check (public.is_admin());

create policy "Admin can update sections"
  on public.sections for update
  using (public.is_admin());

create policy "Admin can delete sections"
  on public.sections for delete
  using (public.is_admin());

create policy "Users can view questions for accessible tests"
  on public.questions for select
  using (public.is_admin() or public.can_access_test(test_id));

create policy "Admin can insert questions"
  on public.questions for insert
  with check (public.is_admin());

create policy "Admin can update questions"
  on public.questions for update
  using (public.is_admin());

create policy "Admin can delete questions"
  on public.questions for delete
  using (public.is_admin());

create policy "Only admin can view question keys directly"
  on public.question_keys for select
  using (public.is_admin());

create policy "Admin can insert question keys"
  on public.question_keys for insert
  with check (public.is_admin());

create policy "Admin can update question keys"
  on public.question_keys for update
  using (public.is_admin());

create policy "Admin can delete question keys"
  on public.question_keys for delete
  using (public.is_admin());

create policy "Users can view own test access or admin view all"
  on public.test_access for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admin can manage test access"
  on public.test_access for all
  using (public.is_admin());

create policy "Users can view own attempts or admin view all"
  on public.attempts for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Students can insert own attempts if test accessible"
  on public.attempts for insert
  with check (auth.uid() = user_id and public.can_access_test(test_id));

create policy "Students can update own in-progress attempt drafts"
  on public.attempts for update
  using ((auth.uid() = user_id and status = 'in_progress') or public.is_admin());

create policy "Admin can delete attempts"
  on public.attempts for delete
  using (public.is_admin());

create policy "Users can view answers of their own attempts or admin view all"
  on public.attempt_answers for select
  using (
    exists (
      select 1 from public.attempts
      where attempts.id = attempt_answers.attempt_id
        and (attempts.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "System or admin can insert/modify attempt answers"
  on public.attempt_answers for all
  using (
    public.is_admin() or exists (
      select 1 from public.attempts
      where attempts.id = attempt_answers.attempt_id
        and attempts.user_id = auth.uid()
        and attempts.status = 'in_progress'
    )
  );

create policy "Users view own access requests or admin view all"
  on public.access_requests for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admin can manage access requests"
  on public.access_requests for all
  using (public.is_admin());

create policy "Admin can view email log"
  on public.email_log for select
  using (public.is_admin());

create policy "Admin or service can insert email log"
  on public.email_log for insert
  with check (public.is_admin());

create policy "Users view own skills practice or admin view all"
  on public.st_skills_practice for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Students can log practice or admin can grade skills"
  on public.st_skills_practice for all
  using (auth.uid() = user_id or public.is_admin());

