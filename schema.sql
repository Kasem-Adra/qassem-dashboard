CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS content_versions (id TEXT PRIMARY KEY, value TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, actor TEXT DEFAULT 'admin');
CREATE TABLE IF NOT EXISTS snapshots (id TEXT PRIMARY KEY, label TEXT, value TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, actor TEXT DEFAULT 'admin');
CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, filename TEXT NOT NULL, key TEXT NOT NULL, type TEXT, size INTEGER, url TEXT, alt TEXT, width INTEGER, height INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS analytics_events (id TEXT PRIMARY KEY, path TEXT, referrer TEXT, user_agent TEXT, country TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS seo_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, action TEXT NOT NULL, metadata TEXT, ip TEXT, user_agent TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', expires_at INTEGER NOT NULL, revoked_at INTEGER, ip TEXT, user_agent TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS security_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);

-- ABOS Cortex V1 operational intelligence schema
CREATE TABLE IF NOT EXISTS abos_organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  health_score INTEGER DEFAULT 70,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abos_projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  owner TEXT,
  deadline TEXT,
  revenue_impact INTEGER DEFAULT 0,
  customer_impact INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abos_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  due_date TEXT,
  delay_probability INTEGER DEFAULT 0,
  dependencies TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abos_activities (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abos_ai_insights (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  insight TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence_score INTEGER DEFAULT 0,
  evidence TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
