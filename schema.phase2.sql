CREATE TABLE IF NOT EXISTS ai_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'local',
  model TEXT NOT NULL DEFAULT 'edge-simulated-runtime',
  title TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES ai_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  actor_id TEXT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS theme_versions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  tokens TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_workspace ON ai_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_workspace_events_workspace ON workspace_events(workspace_id, created_at);

-- ABOS Cortex V1 operational intelligence schema
CREATE TABLE IF NOT EXISTS abos_organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, health_score INTEGER DEFAULT 70, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS abos_projects (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT DEFAULT 'active', owner TEXT, deadline TEXT, revenue_impact INTEGER DEFAULT 0, customer_impact INTEGER DEFAULT 0, risk_score INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS abos_tasks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT DEFAULT 'todo', priority TEXT DEFAULT 'medium', assigned_to TEXT, due_date TEXT, delay_probability INTEGER DEFAULT 0, dependencies TEXT DEFAULT '[]', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS abos_activities (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, action TEXT NOT NULL, severity TEXT DEFAULT 'info', metadata TEXT DEFAULT '{}', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS abos_ai_insights (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, severity TEXT NOT NULL, insight TEXT NOT NULL, recommendation TEXT NOT NULL, confidence_score INTEGER DEFAULT 0, evidence TEXT DEFAULT '[]', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
