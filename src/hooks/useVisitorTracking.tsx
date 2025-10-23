import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const trackVisitor = async () => {
      // Generate or retrieve session ID
      let currentSessionId = sessionStorage.getItem('visitor_session_id');
      if (!currentSessionId) {
        currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('visitor_session_id', currentSessionId);
      }
      setSessionId(currentSessionId);

      // Detect and persist source with enhanced detection
      let source = sessionStorage.getItem('visitor_source');
      
      if (!source) {
        // First check URL parameters (highest priority)
        const urlParams = new URLSearchParams(window.location.search);
        source = urlParams.get('source') || urlParams.get('utm_source') || urlParams.get('ref');
        
        if (!source) {
          // Check referrer for social media sources
          const referrer = document.referrer.toLowerCase();
          
          if (referrer.includes('snapchat') || referrer.includes('sc-') || referrer.includes('snap')) {
            source = 'snapchat';
          } else if (referrer.includes('tiktok') || referrer.includes('ttweb') || referrer.includes('bytedance')) {
            source = 'tiktok';
          } else if (referrer.includes('facebook') || referrer.includes('fb.com') || referrer.includes('fbclid') || referrer.includes('instagram') || referrer.includes('ig.me')) {
            source = 'facebook';
          } else if (referrer.includes('google') || referrer.includes('gclid') || referrer.includes('googleads')) {
            source = 'google';
          } else if (referrer.includes('whatsapp') || referrer.includes('wa.me') || referrer.includes('chat.whatsapp')) {
            source = 'whatsapp';
          } else if (referrer.includes('twitter') || referrer.includes('t.co') || referrer.includes('x.com')) {
            source = 'twitter';
          } else if (referrer && !referrer.includes(window.location.hostname)) {
            // Extract domain from referrer for better tracking
            try {
              const referrerUrl = new URL(referrer);
              source = `referral-${referrerUrl.hostname.replace('www.', '')}`;
            } catch {
              source = 'referral';
            }
          } else {
            source = 'direct';
          }
        }
        
        // Save source to session storage
        sessionStorage.setItem('visitor_source', source);
        console.log('🎯 مصدر الزيارة:', source);
      }

      try {
        // Insert or update visitor tracking
        const { error } = await supabase
          .from('visitor_tracking')
          .upsert({
            session_id: currentSessionId,
            source,
            page_url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            is_active: true,
            last_active_at: new Date().toISOString()
          }, {
            onConflict: 'session_id'
          });

        if (error) console.error('Error tracking visitor:', error);

        // Update activity every 30 seconds
        const activityInterval = setInterval(async () => {
          await supabase
            .from('visitor_tracking')
            .update({
              is_active: true,
              last_active_at: new Date().toISOString(),
              page_url: window.location.href
            })
            .eq('session_id', currentSessionId);
        }, 30000);

        // Mark as inactive on page unload
        const handleUnload = async () => {
          await supabase
            .from('visitor_tracking')
            .update({
              is_active: false
            })
            .eq('session_id', currentSessionId);
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
          clearInterval(activityInterval);
          window.removeEventListener('beforeunload', handleUnload);
        };
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    trackVisitor();
  }, []);

  return sessionId;
};
