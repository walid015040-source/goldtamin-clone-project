import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SessionReplayPlayer } from "@/components/SessionReplayPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Clock, MousePointer, FileText } from "lucide-react";

interface SessionRecording {
  id: string;
  session_id: string;
  events: any;
  duration: number;
  click_count: number;
  page_count: number;
  created_at: string;
}

export default function AdminSessionRecordings() {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchRecordings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('session_recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

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
    <div className="flex min-h-screen bg-background" dir="rtl">
      <AdminSidebar />
      
      <div className="flex-1 p-8 mr-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">تسجيلات الجلسات</h1>

          {loading ? (
            <div className="text-center py-12">جاري التحميل...</div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد تسجيلات متاحة
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recordings List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-semibold mb-4">قائمة التسجيلات</h2>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {recordings.map((recording) => (
                    <Card
                      key={recording.id}
                      className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                        selectedRecording?.id === recording.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedRecording(recording)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">
                            {recording.session_id.substring(0, 20)}...
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(recording.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-3 h-3" />
                          <span>{recording.click_count} نقرة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>{recording.page_count} صفحة</span>
                        </div>
                        <div className="text-xs">
                          {new Date(recording.created_at).toLocaleString('ar-SA')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Player */}
              <div className="lg:col-span-2">
                <div className="sticky top-8">
                  <h2 className="text-xl font-semibold mb-4">عرض التسجيل</h2>
                  {selectedRecording ? (
                    <Card className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">معلومات الجلسة</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">المدة: </span>
                            <span className="font-medium">{formatDuration(selectedRecording.duration)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">النقرات: </span>
                            <span className="font-medium">{selectedRecording.click_count}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الصفحات: </span>
                            <span className="font-medium">{selectedRecording.page_count}</span>
                          </div>
                        </div>
                      </div>
                      <SessionReplayPlayer events={selectedRecording.events} />
                    </Card>
                  ) : (
                    <Card className="p-12">
                      <div className="text-center text-muted-foreground">
                        اختر تسجيلاً لعرضه
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
