-- Supabase Migration: 20261109000001_v3_practice_mode.sql
-- V3 Additions: Practice Test Mode, mode_config, admin_note, and flexible question counts

-- 1. Add mode_config to tests table
alter table public.tests
  add column if not exists mode_config jsonb default '{"instant_feedback": false, "timer": "mandatory", "suggested_minutes": 60, "show_explanation": false, "allow_retry": true, "shuffle_questions": false, "shuffle_options": false}'::jsonb;

-- 2. Add admin_note to question_keys table (strictly service role / admin accessible)
alter table public.question_keys
  add column if not exists admin_note text;

-- 3. Update can_access_test function:
-- Rule A.2: Pending (not yet approved) students can open the first free mock AND any practice test marked is_free=true.
-- Everything else stays locked (enforced by RLS + Edge Functions, not just UI).
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
  -- 1. Admins have access to everything
  if public.is_admin() then
    return true;
  end if;

  -- 2. Must be logged in
  if auth.uid() is null then
    return false;
  end if;

  -- 3. Fetch test metadata
  select is_free, is_published into v_is_free, v_is_published
  from public.tests
  where id = p_test_id;

  if not found or not v_is_published then
    return false;
  end if;

  -- 4. Any published test marked is_free=true (Free Mock or Free Practice Set) is accessible to any registered student
  if v_is_free then
    return true;
  end if;

  -- 5. Check if user is approved
  select status into v_user_status
  from public.profiles
  where id = auth.uid();

  if v_user_status = 'approved' then
    return true;
  end if;

  -- 6. Check per-test access override
  select exists (
    select 1 from public.test_access
    where user_id = auth.uid() and test_id = p_test_id
  ) into v_has_override;

  return v_has_override;
end;
$$;

