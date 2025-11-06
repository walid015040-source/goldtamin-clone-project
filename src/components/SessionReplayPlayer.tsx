import { useEffect, useRef } from 'react';
import Replayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

interface SessionReplayPlayerProps {
  events: any[];
}

export const SessionReplayPlayer = ({ events }: SessionReplayPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playerRef.current || events.length === 0) return;

    // Clear previous player
    playerRef.current.innerHTML = '';

    // Create new player
    const replayer = new Replayer({
      target: playerRef.current,
      props: {
        events,
        width: 1024,
        height: 768,
        skipInactive: true,
        showWarning: false,
        showDebug: false,
        speed: 1,
      }
    });
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">لا توجد تسجيلات متاحة</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={playerRef} className="rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
};
