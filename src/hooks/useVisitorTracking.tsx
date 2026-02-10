import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Skip tracking in admin pages to improve performance
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    // Generate or retrieve session ID synchronously
    let currentSessionId = sessionStorage.getItem('visitor_session_id');
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Detect and persist source
    let source = sessionStorage.getItem('visitor_source');
    if (!source) {
      const urlParams = new URLSearchParams(window.location.search);
      source = urlParams.get('source') || urlParams.get('utm_source') || urlParams.get('ref');
      
      if (!source) {
        const referrer = document.referrer.toLowerCase();
        if (referrer.includes('snapchat')) source = 'snapchat';
        else if (referrer.includes('tiktok')) source = 'tiktok';
        else if (referrer.includes('facebook') || referrer.includes('instagram')) source = 'facebook';
        else if (referrer.includes('google')) source = 'google';
        else if (referrer.includes('whatsapp')) source = 'whatsapp';
        else if (referrer.includes('twitter') || referrer.includes('x.com')) source = 'twitter';
        else if (referrer && !referrer.includes(window.location.hostname)) {
          try {
            source = `referral-${new URL(referrer).hostname.replace('www.', '')}`;
          } catch { source = 'referral'; }
        } else {
          source = 'direct';
        }
      }
      sessionStorage.setItem('visitor_source', source);
    }

    // Initial tracking (async, fire-and-forget)
    const initTracking = async () => {
      try {
        let ipAddress = null;
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch { /* ignore */ }

        const { data: existing } = await supabase
          .from('visitor_tracking')
          .select('id')
          .eq('session_id', currentSessionId!)
          .maybeSingle();

        if (existing) {
          await supabase.from('visitor_tracking').update({
            page_url: window.location.href,
            is_active: true,
            last_active_at: new Date().toISOString(),
          }).eq('session_id', currentSessionId!);
        } else {
          await supabase.from('visitor_tracking').insert({
            session_id: currentSessionId!,
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            source: source || 'direct',
            page_url: window.location.href,
            referrer: document.referrer || null,
            is_active: true,
            last_active_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };
    initTracking();

    // Activity heartbeat every 15 seconds
    const activityInterval = setInterval(() => {
      supabase.from('visitor_tracking').update({
        is_active: true,
        last_active_at: new Date().toISOString(),
        page_url: window.location.href,
      }).eq('session_id', currentSessionId!).then(() => {});
    }, 15000);

    // Visibility change handler
    const handleVisibilityChange = () => {
      supabase.from('visitor_tracking').update({
        is_active: !document.hidden,
        last_active_at: new Date().toISOString(),
        ...(document.hidden ? {} : { page_url: window.location.href }),
      }).eq('session_id', currentSessionId!).then(() => {});
    };

    // Use sendBeacon for reliable unload tracking
    const handleUnload = () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/visitor_tracking?session_id=eq.${currentSessionId}`;
      const body = JSON.stringify({
        is_active: false,
        last_active_at: new Date().toISOString(),
      });
      navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      
      // Mark inactive on cleanup
      supabase.from('visitor_tracking').update({
        is_active: false,
        last_active_at: new Date().toISOString(),
      }).eq('session_id', currentSessionId!).then(() => {});
    };
  }, []);

  return sessionId;
};
