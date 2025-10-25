import { useEffect, useRef } from 'react';
import { record } from 'rrweb';
import { supabase } from '@/integrations/supabase/client';

type RRwebEvent = any;

export const useSessionRecording = (sessionId: string | null) => {
  const eventsRef = useRef<RRwebEvent[]>([]);
  const stopFnRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pageCountRef = useRef<number>(1);
  const clickCountRef = useRef<number>(0);
  const hasRecordingStarted = useRef(false);

  useEffect(() => {
    if (!sessionId || hasRecordingStarted.current) return;

    console.log('🎥 بدء تسجيل الجلسة:', sessionId);
    hasRecordingStarted.current = true;

    // Start recording
    stopFnRef.current = record({
      emit(event) {
        eventsRef.current.push(event);
        
        // Count clicks
        if (event.type === 3 && (event as any).data?.source === 2) {
          clickCountRef.current++;
        }
        
        // Auto-save when too many events
        if (eventsRef.current.length > 100) {
          saveRecording();
        }
      },
      checkoutEveryNms: 60 * 1000, // Checkpoint every minute
    });

    // Track page changes
    const handlePageChange = () => {
      pageCountRef.current++;
    };

    window.addEventListener('popstate', handlePageChange);

    // Save recording before unload
    const handleBeforeUnload = () => {
      saveRecording(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Auto-save every 30 seconds
    const saveInterval = setInterval(() => {
      if (eventsRef.current.length > 0) {
        saveRecording();
      }
    }, 30000);

    const saveRecording = async (isFinal = false) => {
      if (eventsRef.current.length === 0) return;

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const events = [...eventsRef.current];

      try {
        const { error } = await supabase
          .from('session_recordings')
          .insert({
            session_id: sessionId,
            events: events,
            duration: duration,
            page_count: pageCountRef.current,
            click_count: clickCountRef.current,
            is_processed: isFinal
          });

        if (error) {
          console.error('❌ خطأ في حفظ التسجيل:', error);
        } else {
          console.log('✅ تم حفظ التسجيل:', {
            duration,
            events: events.length,
            pages: pageCountRef.current,
            clicks: clickCountRef.current
          });
          
          // Clear saved events if not final
          if (!isFinal) {
            eventsRef.current = [];
          }
        }
      } catch (error) {
        console.error('❌ خطأ في حفظ التسجيل:', error);
      }
    };

    return () => {
      window.removeEventListener('popstate', handlePageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(saveInterval);
      
      if (stopFnRef.current) {
        stopFnRef.current();
        saveRecording(true);
      }
    };
  }, [sessionId]);
};
