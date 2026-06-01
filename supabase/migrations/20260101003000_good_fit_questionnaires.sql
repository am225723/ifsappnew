-- Good-fit questionnaire submissions for separate sendable client screening page.

create table if not exists public.good_fit_questionnaires (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  preferred_name text,
  dob date,
  email text not null,
  mobile text,
  current_location text,
  contact_preference jsonb not null default '[]'::jsonb,
  voicemail_consent boolean not null default false,
  appointment_goals jsonb not null default '[]'::jsonb,
  primary_concerns jsonb not null default '[]'::jsonb,
  presenting_summary text,
  treatment_goals text,
  practice_fit jsonb not null default '[]'::jsonb,
  open_to_non_medication boolean,
  interested_in_therapy text,
  current_treatment text,
  functioning_impact text,
  safety_recent_si text,
  safety_self_harm text,
  safety_harm_others text,
  safety_hospitalization text,
  current_crisis boolean not null default false,
  current_medications text,
  past_treatment text,
  medical_conditions text,
  substance_use text,
  adhd_interest text,
  stimulant_request text,
  ketamine_interest text,
  ketamine_risk_factors jsonb not null default '[]'::jsonb,
  preferred_visit_type text,
  availability jsonb not null default '[]'::jsonb,
  payment_type jsonb not null default '[]'::jsonb,
  insurance_provider text,
  legal_or_forensic_request text,
  additional_context text,
  acknowledgment boolean not null default false,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists good_fit_questionnaires_status_created_idx on public.good_fit_questionnaires(status, created_at desc);
create index if not exists good_fit_questionnaires_search_idx on public.good_fit_questionnaires using gin (to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(presenting_summary,'')));

alter table public.good_fit_questionnaires enable row level security;

create policy "authorized users can read good fit questionnaires"
  on public.good_fit_questionnaires for select
  using (public.has_role('viewer'));

create policy "admins can update good fit questionnaires"
  on public.good_fit_questionnaires for update
  using (public.is_admin())
  with check (public.is_admin());

-- Public users do not insert directly. Inserts happen through the submit-good-fit Edge Function using the service role key.
