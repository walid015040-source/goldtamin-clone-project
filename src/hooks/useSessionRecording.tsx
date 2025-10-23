import { useEffect, useRef } from 'react';
import { record } from 'rrweb';
import { supabase } from '@/integrations/supabase/client';

export const useSessionRecording = (sessionId: string | null) => {
  const eventsRef = useRef<any[]>([]);
  const stopFnRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const clickCountRef = useRef<number>(0);
  const pageCountRef = useRef<number>(1);
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!sessionId) return;

    console.log('🎬 بدء تسجيل الجلسة:', sessionId);

    // Start recording
    stopFnRef.current = record({
      emit(event) {
        eventsRef.current.push(event);

        // Count clicks
        if (event.type === 3 && (event as any).data?.source === 2) {
          clickCountRef.current++;
        }

        // Save to database every 30 seconds or when we have 100+ events
        const now = Date.now();
        if (
          eventsRef.current.length >= 100 ||
          now - lastSaveRef.current > 30000
        ) {
          saveRecording(false);
          lastSaveRef.current = now;
        }
      },
      recordCanvas: true,
      sampling: {
        input: 'last', // Record last value of input
        mousemove: true,
        mouseInteraction: true,
        scroll: 150, // Record scroll events every 150ms
      },
    });

    // Track page changes
    const handleLocationChange = () => {
      pageCountRef.current++;
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Save recording when leaving page
    const handleBeforeUnload = () => {
      saveRecording(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Auto-save every 30 seconds
    const saveInterval = setInterval(() => {
      if (eventsRef.current.length > 0) {
        saveRecording(false);
      }
    }, 30000);

    return () => {
      if (stopFnRef.current) {
        stopFnRef.current();
      }
      saveRecording(true);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(saveInterval);
    };
  }, [sessionId]);

  const saveRecording = async (isFinal: boolean) => {
    if (!sessionId || eventsRef.current.length === 0) return;

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    try {
      const { error } = await supabase
        .from('session_recordings')
        .insert({
          session_id: sessionId,
          events: eventsRef.current,
          duration,
          page_count: pageCountRef.current,
          click_count: clickCountRef.current,
          is_processed: isFinal,
        });

      if (error) {
        console.error('خطأ في حفظ التسجيل:', error);
      } else {
        console.log(`✅ تم حفظ ${eventsRef.current.length} حدث`);
        // Clear events after successful save (but keep recording)
        if (!isFinal) {
          eventsRef.current = [];
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ التسجيل:', error);
    }
  };

  return null;
};
