import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Skip tracking in admin pages to improve performance
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    const trackVisitor = async () => {
      try {
        // Generate or retrieve session ID
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
            
            if (referrer.includes('snapchat')) {
              source = 'snapchat';
            } else if (referrer.includes('tiktok')) {
              source = 'tiktok';
            } else if (referrer.includes('facebook') || referrer.includes('instagram')) {
              source = 'facebook';
            } else if (referrer.includes('google')) {
              source = 'google';
            } else if (referrer.includes('whatsapp')) {
              source = 'whatsapp';
            } else if (referrer.includes('twitter') || referrer.includes('x.com')) {
              source = 'twitter';
            } else if (referrer && !referrer.includes(window.location.hostname)) {
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
          
          sessionStorage.setItem('visitor_source', source);
          console.log('🎯 مصدر الزيارة:', source);
        }

        // Get visitor IP
        let ipAddress = null;
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
          console.log('🌐 IP العميل:', ipAddress);
        } catch (ipError) {
          console.error('Error fetching IP:', ipError);
        }

        // Check if session exists
        const { data: existingSession } = await supabase
          .from('visitor_tracking')
          .select('id')
          .eq('session_id', currentSessionId)
          .maybeSingle();

        if (existingSession) {
          // Update existing session quietly
          try {
            await supabase
              .from('visitor_tracking')
              .update({
                page_url: window.location.href,
                is_active: true,
                last_active_at: new Date().toISOString()
              })
              .eq('session_id', currentSessionId);
          } catch (error) {
            // Silently ignore
          }
        } else {
          // Insert new session with error handling
          try {
            await supabase
              .from('visitor_tracking')
              .insert({
                session_id: currentSessionId,
                source,
                page_url: window.location.href,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
                ip_address: ipAddress,
                is_active: true,
                last_active_at: new Date().toISOString()
              });
            console.log('✅ تم حفظ بيانات الزائر بنجاح');
          } catch (error) {
            // Silently ignore duplicate key errors
          }
        }

        // Update activity every 15 seconds for accurate tracking
        const activityInterval = setInterval(async () => {
          try {
            await supabase
              .from('visitor_tracking')
              .update({
                is_active: true,
                last_active_at: new Date().toISOString(),
                page_url: window.location.href
              })
              .eq('session_id', currentSessionId);
          } catch (error) {
            // Silently ignore errors
          }
        }, 15000); // Update every 15 seconds

        // استخدام Page Visibility API لتتبع عندما يترك المستخدم الصفحة
        const handleVisibilityChange = async () => {
          if (document.hidden) {
            // الصفحة مخفية - ضع المستخدم كغير نشط
            try {
              await supabase
                .from('visitor_tracking')
                .update({
                  is_active: false,
                  last_active_at: new Date().toISOString()
                })
                .eq('session_id', currentSessionId);
            } catch (error) {
              // Silently ignore
            }
          } else {
            // الصفحة ظاهرة مرة أخرى - ضع المستخدم كنشط
            try {
              await supabase
                .from('visitor_tracking')
                .update({
                  is_active: true,
                  last_active_at: new Date().toISOString(),
                  page_url: window.location.href
                })
                .eq('session_id', currentSessionId);
            } catch (error) {
              // Silently ignore
            }
          }
        };

        // Mark as inactive when page loses focus or closes
        const handleUnload = async () => {
          // تحديث حالة الزائر كغير نشط
          try {
            await supabase
              .from('visitor_tracking')
              .update({
                is_active: false,
                last_active_at: new Date().toISOString()
              })
              .eq('session_id', currentSessionId);
          } catch (error) {
            // Silently ignore
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pagehide', handleUnload);

        return () => {
          clearInterval(activityInterval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('beforeunload', handleUnload);
          window.removeEventListener('pagehide', handleUnload);
          
          // تحديث نهائي عند تفكيك المكون
          supabase
            .from('visitor_tracking')
            .update({
              is_active: false,
              last_active_at: new Date().toISOString()
            })
            .eq('session_id', currentSessionId);
        };
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    trackVisitor();
  }, []);

  return sessionId;
};
