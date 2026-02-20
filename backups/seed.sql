-- =============================================================================
-- tunix-crm seed data
-- Run AFTER schema.sql on a fresh database
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Fixed UUIDs for easy cross-reference
-- ---------------------------------------------------------------------------
-- Users
-- admin:          3d9e7c2a-1b5f-4e83-9a6d-c8f0e2b4d716
-- coach Jordan:   7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891
-- coach Morgan:   1e5c9a3f-7b2d-4e68-a4f1-d0c8b3e5f792
-- client Sam:     9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794
-- client Jamie:   5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396
-- client Taylor:  2b6d4e8a-9c1f-4d53-8b7e-a3c5e1d0f297
-- Programs
-- program 1:      4e1a7c3f-8b2d-4e96-a5f0-d2c1b8e3a574
-- program 2:      8c3b5e1a-2d4f-4a78-b9e6-f1d0c7a3b285
-- Clients (join records)
-- client 1:       6f2e4a8b-1c3d-4f95-9e7a-b0d2c4f6e318  (Sam, coach Jordan)
-- client 2:       3a7c1e5f-9b2d-4e84-8f6a-c1d3b5e7f409  (Jamie, coach Jordan)
-- client 3:       1d5e9a3c-7f2b-4d61-b8e4-a0c2d6f3e520  (Taylor, coach Morgan)

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
INSERT INTO public.users (id, email, role, first_name, last_name, phone, bio, created_at) VALUES
  ('3d9e7c2a-1b5f-4e83-9a6d-c8f0e2b4d716', 'admin@tunix.com',   'Admin', 'Alex',   'Admin',   '555-0100', 'Platform administrator.',                              NOW()),
  ('7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891', 'coach1@tunix.com',  'Coach', 'Jordan', 'Rivera',  '555-0101', 'Certified strength & conditioning coach, 8 yrs exp.',  NOW()),
  ('1e5c9a3f-7b2d-4e68-a4f1-d0c8b3e5f792', 'coach2@tunix.com',  'Coach', 'Morgan', 'Steele',  '555-0102', 'Specialist in neuro-rehab and mobility work.',         NOW()),
  ('9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794', 'client1@email.com', 'Client','Sam',    'Torres',  '555-0201', NULL,                                                   NOW()),
  ('5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396', 'client2@email.com', 'Client','Jamie',  'Okafor',  '555-0202', NULL,                                                   NOW()),
  ('2b6d4e8a-9c1f-4d53-8b7e-a3c5e1d0f297', 'client3@email.com', 'Client','Taylor', 'Nguyen',  '555-0203', NULL,                                                   NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. exercises (no FK deps)
-- ---------------------------------------------------------------------------
INSERT INTO public.exercises (id, name, difficulty, tags) VALUES
  (gen_random_uuid(), 'Barbell Back Squat',    'Intermediate', 'legs,compound,strength'),
  (gen_random_uuid(), 'Romanian Deadlift',     'Intermediate', 'hamstrings,posterior-chain'),
  (gen_random_uuid(), 'Cable Face Pull',       'Beginner',     'shoulders,rehab'),
  (gen_random_uuid(), 'Bulgarian Split Squat', 'Advanced',     'legs,unilateral'),
  (gen_random_uuid(), 'Pallof Press',          'Beginner',     'core,stability')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. programs  (client_id → users.id)
-- ---------------------------------------------------------------------------
INSERT INTO public.programs (id, client_id, status, workout, tags, name) VALUES
  (
    '4e1a7c3f-8b2d-4e96-a5f0-d2c1b8e3a574',
    '9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794',  -- Sam Torres
    'active',
    '{"weeks": 8, "days_per_week": 3, "focus": "hypertrophy"}',
    'strength,hypertrophy',
    '8-Week Hypertrophy Block'
  ),
  (
    '8c3b5e1a-2d4f-4a78-b9e6-f1d0c7a3b285',
    '5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396',  -- Jamie Okafor
    'draft',
    '{"weeks": 4, "days_per_week": 2, "focus": "rehab"}',
    'rehab,mobility',
    'Post-Op Knee Rehab Phase 1'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. clients  (join records linking user → trainer, with optional program)
-- ---------------------------------------------------------------------------
INSERT INTO public.clients (id, trainer_id, is_active, client_id, current_program, goals, last_session, next_session) VALUES
  (
    '6f2e4a8b-1c3d-4f95-9e7a-b0d2c4f6e318',
    '7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891',  -- coach Jordan
    true,
    '9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794',  -- Sam Torres
    '4e1a7c3f-8b2d-4e96-a5f0-d2c1b8e3a574',  -- 8-Week Hypertrophy
    ARRAY['Build muscle', 'Improve squat form'],
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '3 days'
  ),
  (
    '3a7c1e5f-9b2d-4e84-8f6a-c1d3b5e7f409',
    '7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891',  -- coach Jordan
    true,
    '5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396',  -- Jamie Okafor
    '8c3b5e1a-2d4f-4a78-b9e6-f1d0c7a3b285',  -- Knee Rehab
    ARRAY['Recover from surgery', 'Return to sport'],
    NOW() - INTERVAL '4 days',
    NOW() + INTERVAL '1 day'
  ),
  (
    '1d5e9a3c-7f2b-4d61-b8e4-a0c2d6f3e520',
    '1e5c9a3f-7b2d-4e68-a4f1-d0c8b3e5f792',  -- coach Morgan
    false,
    '2b6d4e8a-9c1f-4d53-8b7e-a3c5e1d0f297',  -- Taylor Nguyen
    NULL,
    ARRAY['Lose weight', 'Improve flexibility'],
    NOW() - INTERVAL '30 days',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. notes  (client_id → users.id)
-- ---------------------------------------------------------------------------
INSERT INTO public.notes (id, client_id, tags, content, created_at, updated_at) VALUES
  (
    gen_random_uuid(),
    '9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794',  -- Sam Torres
    ARRAY['form', 'squat'],
    'Sam is struggling with depth on the squat. Cue to push knees out and sit back more. Follow up next session.',
    CURRENT_DATE - 7,
    NULL
  ),
  (
    gen_random_uuid(),
    '5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396',  -- Jamie Okafor
    ARRAY['rehab', 'knee'],
    'Post-op check-in good. ROM improved to 110 degrees. Cleared to begin light leg press next week.',
    CURRENT_DATE - 4,
    CURRENT_DATE - 4
  ),
  (
    gen_random_uuid(),
    '2b6d4e8a-9c1f-4d53-8b7e-a3c5e1d0f297',  -- Taylor Nguyen
    ARRAY['inactive', 'follow-up'],
    'Client missed last 4 sessions. Left voicemail. May need to pause program.',
    CURRENT_DATE - 30,
    NULL
  )
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. sessions  (client_id / trainer_id → users.id)
-- ---------------------------------------------------------------------------
INSERT INTO public.sessions (id, client_id, trainer_id, session_type, start_time, end_time, description) VALUES
  (
    gen_random_uuid(),
    '9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794',  -- Sam Torres
    '7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891',  -- Jordan Rivera
    'Personal Training',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '60 minutes',
    'Lower body focus. Squats, RDLs, split squats. Good energy today.'
  ),
  (
    gen_random_uuid(),
    '5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396',  -- Jamie Okafor
    '7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891',  -- Jordan Rivera
    'Neuromuscular Reconstruction',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days' + INTERVAL '45 minutes',
    'Knee rehab session. Focused on quad activation and single-leg balance.'
  ),
  (
    gen_random_uuid(),
    '9f3b1e7c-4a2d-4e85-b6f0-c1d8e3a5b794',  -- Sam Torres
    '7a2f4b8e-3c1d-4f96-8e5a-b2d0c7f3e891',  -- Jordan Rivera
    'Personal Training',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '60 minutes',
    'Scheduled: Upper body push. Bench, OHP, lateral raises.'
  ),
  (
    gen_random_uuid(),
    '5c8e2a4f-1d3b-4f71-9e6a-b0c2d4f8e396',  -- Jamie Okafor
    '1e5c9a3f-7b2d-4e68-a4f1-d0c8b3e5f792',  -- Morgan Steele
    'Stretch',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
    'Scheduled: Hip flexor and IT band mobility work.'
  )
ON CONFLICT DO NOTHING;
