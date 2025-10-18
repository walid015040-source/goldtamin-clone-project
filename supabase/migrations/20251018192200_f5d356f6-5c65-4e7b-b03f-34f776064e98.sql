-- Create visitor_tracking table
CREATE TABLE public.visitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visitor_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all visitors"
  ON public.visitor_tracking FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert visitor tracking"
  ON public.visitor_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own visitor tracking"
  ON public.visitor_tracking FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_visitor_tracking_created_at ON public.visitor_tracking(created_at);
CREATE INDEX idx_visitor_tracking_is_active ON public.visitor_tracking(is_active);
CREATE INDEX idx_visitor_tracking_source ON public.visitor_tracking(source);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_tracking;