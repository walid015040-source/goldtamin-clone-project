import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Replayer } from 'rrweb';
import 'rrweb-player/dist/style.css';

const AdminSessionReplayPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<Replayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    if (id) fetchRecording();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const fetchRecording = async () => {
    try {
      const { data, error } = await supabase
        .from('session_recordings')
        .select('events')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data?.events) {
        setEvents(data.events as any[]);
        initializePlayer(data.events as any[]);
      }
    } catch (error) {
      console.error('خطأ في جلب التسجيل:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializePlayer = (eventsData: any[]) => {
    if (!containerRef.current || eventsData.length === 0) return;

    // Clear previous player
    if (playerRef.current) {
      playerRef.current.pause();
    }

    // Initialize new player
    playerRef.current = new Replayer(eventsData, {
      root: containerRef.current,
      speed: 1,
      skipInactive: true,
      showWarning: false,
      showDebug: false,
    });
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!playerRef.current) return;
    playerRef.current.pause();
    initializePlayer(events);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed: number) => {
    if (!playerRef.current) return;
    playerRef.current.setConfig({ speed });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2A1F3D] to-[#1A1F2C] text-white" dir="rtl">
      <AdminSidebar />
      
      <div className="lg:mr-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/session-replays')}
              className="border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold">مشغل التسجيل 🎬</h1>
              <p className="text-gray-400 mt-1">شاهد تسجيل جلسة الزائر</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">جاري تحميل التسجيل...</p>
            </div>
          ) : (
            <>
              <Card className="p-4 bg-white/5 border-white/10 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button onClick={handleRestart} variant="outline" className="border-white/20">
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button onClick={handlePlayPause} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          تشغيل
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleSpeedChange(0.5)} variant="outline" className="border-white/20">
                      0.5x
                    </Button>
                    <Button onClick={() => handleSpeedChange(1)} variant="outline" className="border-white/20">
                      1x
                    </Button>
                    <Button onClick={() => handleSpeedChange(2)} variant="outline" className="border-white/20">
                      2x
                    </Button>
                    <Button onClick={() => handleSpeedChange(4)} variant="outline" className="border-white/20">
                      4x
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border-white/10 overflow-hidden">
                <div 
                  ref={containerRef}
                  className="w-full min-h-[600px] bg-white rounded-lg"
                  style={{ 
                    transform: 'scale(0.9)',
                    transformOrigin: 'top center'
                  }}
                />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSessionReplayPlayer;
