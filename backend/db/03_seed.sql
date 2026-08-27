-- ============================================================
-- GEN SAFE EXAM — reference seed (matches the frontend demo data)
-- Passwords for demo accounts: hash of 'Password@123' via app hashing.
-- ============================================================

INSERT INTO organizations (id, type, parent_id, name, code, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'PLATFORM',   NULL,                                   'GEN SAFE EXAM Platform', 'GSE',       'ACTIVE'),
  ('00000000-0000-0000-0000-000000000002', 'UNIVERSITY', '00000000-0000-0000-0000-000000000001', 'Shivaji University',     'SUK',       'ACTIVE'),
  ('00000000-0000-0000-0000-000000000003', 'COLLEGE',    '00000000-0000-0000-0000-000000000002', 'D.K.T.E. Society''s Textile & Engineering Institute', 'DKTE-TEI', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000004', 'DEPARTMENT', '00000000-0000-0000-0000-000000000003', 'Computer Science & Engineering',      'CSE', 'VERIFIED'),
  ('00000000-0000-0000-0000-000000000005', 'DEPARTMENT', '00000000-0000-0000-0000-000000000003', 'Information Technology',              'IT',  'VERIFIED'),
  ('00000000-0000-0000-0000-000000000006', 'DEPARTMENT', '00000000-0000-0000-0000-000000000003', 'Commerce',                            'COM', 'UNDER_REVIEW');

INSERT INTO roles (name) VALUES
  ('SUPER_ADMIN'),('UNIVERSITY_ADMIN'),('UNIVERSITY_EXAM_CONTROLLER'),
  ('COLLEGE_ADMIN'),('COLLEGE_EXAM_OFFICER'),('DEPARTMENT_HEAD'),
  ('DEPARTMENT_STAFF'),('AUDITOR');

-- Users are created through the invitation + verification workflow;
-- this seed only provisions the Super Admin bootstrap account.
-- password_hash must be generated with backend/src/security/passwords.js
