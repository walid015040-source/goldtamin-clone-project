import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEventTracking = (sessionId: string | null) => {
  useEffect(() => {
    if (!sessionId) return;

    const trackEvent = async (eventType: string, eventData: any) => {
      try {
        await supabase.from('visitor_events').insert({
          session_id: sessionId,
          event_type: eventType,
          event_data: eventData,
          page_url: window.location.href,
        });
      } catch (error) {
        console.error('خطأ في تسجيل الحدث:', error);
      }
    };

    // Track page view
    trackEvent('page_view', {
      title: document.title,
      path: window.location.pathname,
    });

    // Track all clicks on buttons and links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a');
      
      if (button) {
        const text = button.textContent?.trim() || '';
        const href = button.getAttribute('href') || '';
        const className = button.className || '';
        
        trackEvent('click', {
          element: button.tagName,
          text: text.substring(0, 50), // First 50 chars only
          href,
          className,
        });
      }
    };

    // Track form submissions
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data: any = {};
      
      formData.forEach((value, key) => {
        // Don't track sensitive data like passwords, CVV, etc.
        if (!key.toLowerCase().includes('password') && 
            !key.toLowerCase().includes('cvv') &&
            !key.toLowerCase().includes('card')) {
          data[key] = typeof value === 'string' ? value.substring(0, 50) : 'file';
        }
      });

      trackEvent('form_submit', {
        form_id: form.id || 'unnamed',
        fields: Object.keys(data),
      });
    };

    // Track input focus (to see what fields users interact with)
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        trackEvent('input_focus', {
          name: target.name || target.id || 'unnamed',
          type: target.type || 'text',
        });
      }
    };

    // Track navigation
    const handleNavigation = () => {
      trackEvent('navigation', {
        from: document.referrer || 'direct',
        to: window.location.href,
      });
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('focusin', handleFocus);
    window.addEventListener('popstate', handleNavigation);

    // Track time spent on page
    const startTime = Date.now();
    const trackPageTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackEvent('page_exit', {
        time_spent: timeSpent,
        path: window.location.pathname,
      });
    };

    window.addEventListener('beforeunload', trackPageTime);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      document.removeEventListener('focusin', handleFocus);
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('beforeunload', trackPageTime);
    };
  }, [sessionId]);
};
