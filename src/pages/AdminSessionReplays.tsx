import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Clock, MousePointer, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SessionRecording {
  id: string;
  session_id: string;
  created_at: string;
  duration: number;
  page_count: number;
  click_count: number;
}

const AdminSessionReplays = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchRecordings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('session_recordings')
        .select('id, session_id, created_at, duration, page_count, click_count')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('خطأ في جلب التسجيلات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2A1F3D] to-[#1A1F2C] text-white" dir="rtl">
      <AdminSidebar />
      
      <div className="lg:mr-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">تسجيلات الجلسات 🎬</h1>
              <p className="text-gray-400">شاهد تسجيلات فيديو كاملة لتحركات الزوار في الموقع</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">جاري تحميل التسجيلات...</p>
            </div>
          ) : recordings.length === 0 ? (
            <Card className="p-8 text-center bg-white/5 border-white/10">
              <p className="text-gray-400">لا توجد تسجيلات حتى الآن</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recordings.map((recording) => (
                <Card
                  key={recording.id}
                  className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate(`/admin/session-replay/${recording.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Play className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          جلسة {recording.session_id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {format(new Date(recording.created_at), 'dd MMMM yyyy - hh:mm a', { locale: ar })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">المدة</span>
                        </div>
                        <p className="font-bold">{formatDuration(recording.duration)}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs">الصفحات</span>
                        </div>
                        <p className="font-bold">{recording.page_count}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <MousePointer className="w-4 h-4" />
                          <span className="text-xs">النقرات</span>
                        </div>
                        <p className="font-bold">{recording.click_count}</p>
                      </div>

                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                        <Play className="w-4 h-4 mr-2" />
                        مشاهدة
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSessionReplays;
