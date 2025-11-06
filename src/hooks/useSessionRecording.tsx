import { useEffect, useRef } from 'react';
import { record } from 'rrweb';
import { supabase } from '@/integrations/supabase/client';

export const useSessionRecording = (sessionId: string | null) => {
  const eventsRef = useRef<any[]>([]);
  const stopRecordingRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const clickCountRef = useRef<number>(0);
  const pageCountRef = useRef<number>(1);

  useEffect(() => {
    if (!sessionId) return;

    // Start recording
    stopRecordingRef.current = record({
      emit(event) {
        eventsRef.current.push(event);
        
        // Track clicks
        if (event.type === 3 && (event.data as any).source === 2) {
          clickCountRef.current++;
        }
      },
      recordCanvas: true,
      collectFonts: true,
      checkoutEveryNms: 60 * 1000, // Save every minute
    });

    // Track page changes
    const handlePageChange = () => {
      pageCountRef.current++;
    };

    window.addEventListener('popstate', handlePageChange);

    // Save recording periodically
    const saveInterval = setInterval(async () => {
      if (eventsRef.current.length > 0) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        try {
          await supabase.from('session_recordings').insert({
            session_id: sessionId,
            events: eventsRef.current,
            duration,
            click_count: clickCountRef.current,
            page_count: pageCountRef.current,
          });
          
          // Reset for next batch
          eventsRef.current = [];
          startTimeRef.current = Date.now();
        } catch (error) {
          console.error('خطأ في حفظ التسجيل:', error);
        }
      }
    }, 60000); // Save every minute

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePageChange);
      clearInterval(saveInterval);
      
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
      }

      // Save final recording
      if (eventsRef.current.length > 0) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        supabase.from('session_recordings').insert({
          session_id: sessionId,
          events: eventsRef.current,
          duration,
          click_count: clickCountRef.current,
          page_count: pageCountRef.current,
        });
      }
    };
  }, [sessionId]);
};
