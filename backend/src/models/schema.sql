-- BHOOMI CHITRA: National Land Acquisition & Management System Database Schema
-- Standard PostgreSQL DDL Compatible with PostgreSQL 14+ and PGlite

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  capital VARCHAR(100),
  total_districts INTEGER DEFAULT 0,
  center_lat NUMERIC(9,6),
  center_lng NUMERIC(9,6)
);

CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  headquarters VARCHAR(100),
  center_lat NUMERIC(9,6),
  center_lng NUMERIC(9,6),
  UNIQUE(state_id, name)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  role_code VARCHAR(50) NOT NULL,
  state_id INTEGER REFERENCES states(id),
  district_id INTEGER REFERENCES districts(id),
  department_agency VARCHAR(150),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  project_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  project_type VARCHAR(100) NOT NULL,
  ministry VARCHAR(150) NOT NULL,
  implementing_agency VARCHAR(150) NOT NULL,
  state_id INTEGER REFERENCES states(id),
  district_id INTEGER REFERENCES districts(id),
  description TEXT,
  estimated_cost_cr NUMERIC(12,2) DEFAULT 0,
  required_land_ha NUMERIC(10,2) DEFAULT 0,
  acquired_land_ha NUMERIC(10,2) DEFAULT 0,
  notified_land_ha NUMERIC(10,2) DEFAULT 0,
  target_completion_date DATE,
  current_status VARCHAR(50) DEFAULT 'DRAFT',
  risk_score INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS acquisition_proposals (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  proposal_number VARCHAR(100) UNIQUE NOT NULL,
  submission_date DATE DEFAULT CURRENT_DATE,
  scrutiny_status VARCHAR(50) DEFAULT 'SUBMITTED',
  scrutiny_remarks TEXT,
  state_forwarded_date DATE,
  central_approved_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS land_parcels (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  parcel_code VARCHAR(100) UNIQUE NOT NULL,
  state_id INTEGER REFERENCES states(id),
  district_id INTEGER REFERENCES districts(id),
  tehsil VARCHAR(100),
  village VARCHAR(100),
  khasra_survey_no VARCHAR(100) NOT NULL,
  land_type VARCHAR(50) DEFAULT 'AGRICULTURAL',
  area_ha NUMERIC(10,4) NOT NULL,
  area_acres NUMERIC(10,4),
  status VARCHAR(50) DEFAULT 'PROPOSED',
  boundary_geojson JSONB,
  centroid_lat NUMERIC(9,6),
  centroid_lng NUMERIC(9,6),
  market_value_inr NUMERIC(14,2) DEFAULT 0,
  verified_by_field_officer BOOLEAN DEFAULT FALSE,
  field_officer_id INTEGER REFERENCES users(id),
  dispute_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS land_owners (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  masked_reference VARCHAR(50) NOT NULL,
  share_percentage NUMERIC(5,2) DEFAULT 100.00,
  contact_masked VARCHAR(50),
  aadhaar_masked VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  current_stage VARCHAR(100) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  assigned_authority VARCHAR(100),
  assigned_officer_id INTEGER REFERENCES users(id),
  due_date DATE,
  completed_date DATE,
  action_taken VARCHAR(100),
  remarks TEXT,
  action_history JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS awards (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  award_number VARCHAR(100) UNIQUE NOT NULL,
  declaration_date DATE NOT NULL,
  total_parcels INTEGER DEFAULT 0,
  total_area_ha NUMERIC(10,4) DEFAULT 0,
  total_award_amount_inr NUMERIC(16,2) DEFAULT 0,
  solatium_amount_inr NUMERIC(16,2) DEFAULT 0,
  competent_authority VARCHAR(150),
  document_id INTEGER,
  status VARCHAR(50) DEFAULT 'DECLARED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affected_families (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  district_id INTEGER REFERENCES districts(id),
  family_code VARCHAR(50) UNIQUE NOT NULL,
  head_name VARCHAR(150) NOT NULL,
  head_masked VARCHAR(50) NOT NULL,
  members_count INTEGER DEFAULT 1,
  category VARCHAR(50) DEFAULT 'GENERAL',
  is_displaced BOOLEAN DEFAULT FALSE,
  eligibility_status VARCHAR(50) DEFAULT 'ELIGIBLE',
  rehabilitation_status VARCHAR(50) DEFAULT 'PENDING',
  livelihood_assistance_status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS displaced_families (
  id SERIAL PRIMARY KEY,
  affected_family_id INTEGER REFERENCES affected_families(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  relocation_site VARCHAR(200),
  housing_allotment_status VARCHAR(50) DEFAULT 'PENDING',
  relocation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compensation_assessments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE CASCADE,
  affected_family_id INTEGER REFERENCES affected_families(id),
  base_market_value NUMERIC(14,2) NOT NULL,
  multiplier_factor NUMERIC(4,2) DEFAULT 1.0,
  solatium_percentage NUMERIC(5,2) DEFAULT 100.0,
  asset_value NUMERIC(14,2) DEFAULT 0,
  total_assessed_amount NUMERIC(16,2) NOT NULL,
  eligible_amount NUMERIC(16,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'ASSESSED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compensation_payments (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES compensation_assessments(id),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  affected_family_id INTEGER REFERENCES affected_families(id),
  disbursed_amount NUMERIC(16,2) DEFAULT 0,
  pending_amount NUMERIC(16,2) DEFAULT 0,
  payment_date DATE,
  payment_mode VARCHAR(50) DEFAULT 'RTGS_PFMS',
  transaction_ref VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'ASSESSED',
  disbursed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rr_cases (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  total_affected INTEGER DEFAULT 0,
  total_displaced INTEGER DEFAULT 0,
  housing_assistance_completed INTEGER DEFAULT 0,
  livelihood_assistance_completed INTEGER DEFAULT 0,
  relocation_completed INTEGER DEFAULT 0,
  rr_completion_percentage NUMERIC(5,2) DEFAULT 0.0,
  nodal_officer_id INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS possession_records (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'PENDING',
  possession_date DATE,
  verified_by_id INTEGER REFERENCES users(id),
  gps_lat NUMERIC(9,6),
  gps_lng NUMERIC(9,6),
  gps_accuracy_m NUMERIC(6,2),
  photo_url TEXT,
  certificate_doc_id INTEGER,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER DEFAULT 0,
  file_type VARCHAR(50),
  version INTEGER DEFAULT 1,
  uploaded_by_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'UPLOADED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  change_summary TEXT,
  uploaded_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  milestone_name VARCHAR(150) NOT NULL,
  stage_code VARCHAR(50) NOT NULL,
  sequence_order INTEGER DEFAULT 1,
  expected_date DATE NOT NULL,
  actual_date DATE,
  delay_days INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ON_TIME',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_name VARCHAR(150),
  role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(50),
  previous_value_json JSONB,
  new_value_json JSONB,
  ip_address VARCHAR(50),
  session_ref VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_scores (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  contributing_factors_json JSONB DEFAULT '[]',
  recommended_actions_json JSONB DEFAULT '[]',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role_target VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'WORKFLOW',
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_parcels_project ON land_parcels(project_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON land_parcels(status);
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state_id);
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(current_status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
