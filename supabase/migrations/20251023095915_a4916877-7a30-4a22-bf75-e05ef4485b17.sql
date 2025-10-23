-- Create visitor_events table to track user actions
CREATE TABLE IF NOT EXISTS public.visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- click, form_fill, page_view, navigation
  event_data JSONB NOT NULL,
  page_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON public.visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_timestamp ON public.visitor_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_type ON public.visitor_events(event_type);

-- Enable RLS
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert events (for visitors)
CREATE POLICY "Anyone can insert visitor events"
ON public.visitor_events
FOR INSERT
WITH CHECK (true);

-- Policy: Only authenticated users can view events
CREATE POLICY "Authenticated users can view events"
ON public.visitor_events
FOR SELECT
USING (auth.role() = 'authenticated');