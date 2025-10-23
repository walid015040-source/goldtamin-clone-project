-- إضافة unique constraint على session_id في جدول visitor_tracking
CREATE UNIQUE INDEX IF NOT EXISTS unique_session_id ON visitor_tracking(session_id);