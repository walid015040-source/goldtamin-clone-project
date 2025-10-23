-- Create session_recordings table to store visitor session replays
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  events JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER, -- في ثواني
  page_count INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  is_processed BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON public.session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_created_at ON public.session_recordings(created_at DESC);

-- Enable RLS
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert recordings (for visitors)
CREATE POLICY "Anyone can insert session recordings"
ON public.session_recordings
FOR INSERT
WITH CHECK (true);

-- Policy: Only authenticated users can view recordings
CREATE POLICY "Authenticated users can view recordings"
ON public.session_recordings
FOR SELECT
USING (auth.role() = 'authenticated');