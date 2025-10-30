import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorStatus {
  is_active: boolean;
  page_url: string | null;
  last_active_at: string | null;
}

export const useVisitorStatus = (sessionId: string | null | undefined) => {
  const [visitorStatus, setVisitorStatus] = useState<VisitorStatus | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVisitorStatus(null);
      return;
    }

    // Fetch initial status
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('visitor_tracking')
        .select('is_active, page_url, last_active_at')
        .eq('session_id', sessionId)
        .order('last_active_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setVisitorStatus(data);
      }
    };

    fetchStatus();

    // استخدام polling للتحديثات المستمرة (كل 5 ثواني)
    const pollingInterval = setInterval(fetchStatus, 5000);

    // Subscribe to realtime updates أيضاً
    const channel = supabase
      .channel(`visitor-status-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitor_tracking',
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          setVisitorStatus({
            is_active: payload.new.is_active,
            page_url: payload.new.page_url,
            last_active_at: payload.new.last_active_at
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollingInterval);
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return visitorStatus;
};
