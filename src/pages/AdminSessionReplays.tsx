import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Play, Clock, MousePointer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Replayer } from 'rrweb';
import 'rrweb-player/dist/style.css';

type RRwebEvent = any;

interface SessionRecording {
  id: string;
  session_id: string;
  events: RRwebEvent[];
  duration: number | null;
  page_count: number | null;
  click_count: number | null;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
}

export default function AdminSessionReplays() {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null);
  const [replayerInstance, setReplayerInstance] = useState<Replayer | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      // Fetch all recordings with customer info in one query using JOIN
      const { data, error } = await supabase
        .from('session_recordings')
        .select(`
          *,
          customer_orders!left(owner_name, phone_number)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const recordingsWithCustomers = (data || []).map((recording: any) => {
        // Get first matching customer order
        const customerOrder = Array.isArray(recording.customer_orders) 
          ? recording.customer_orders[0] 
          : recording.customer_orders;

        return {
          id: recording.id,
          session_id: recording.session_id,
          created_at: recording.created_at,
          events: recording.events as RRwebEvent[],
          duration: recording.duration as number | null,
          page_count: recording.page_count as number | null,
          click_count: recording.click_count as number | null,
          customer_name: customerOrder?.owner_name || null,
          customer_phone: customerOrder?.phone_number || null,
        };
      });
      
      setRecordings(recordingsWithCustomers);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const playRecording = (recording: SessionRecording) => {
    setSelectedRecording(recording);
  };

  const closePlayer = () => {
    if (replayerInstance) {
      replayerInstance.pause();
    }
    setSelectedRecording(null);
    setReplayerInstance(null);
  };

  useEffect(() => {
    if (selectedRecording && !replayerInstance) {
      const container = document.getElementById('replay-container');
      if (container && selectedRecording.events.length > 0) {
        // Clear container first
        container.innerHTML = '';
        
        try {
          const replayer = new Replayer(selectedRecording.events, {
            root: container,
            skipInactive: true,
            showWarning: false,
            showDebug: false,
            speed: 1,
            UNSAFE_replayCanvas: true,
          });
          
          setReplayerInstance(replayer);
          
          // Add slight delay before playing
          setTimeout(() => {
            replayer.play();
          }, 100);
        } catch (error) {
          console.error('خطأ في تشغيل التسجيل:', error);
          container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">خطأ في تشغيل التسجيل. قد تكون البيانات غير مكتملة.</div>';
        }
      }
    }
  }, [selectedRecording, replayerInstance]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/dashboard')}
              className="rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تسجيلات الجلسات</h1>
              <p className="text-gray-600 mt-1">شاهد فيديو replay لنشاط الزوار</p>
            </div>
          </div>
        </div>

        {/* Recordings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : recordings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              لا توجد تسجيلات متاحة حالياً
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-semibold">اسم المالك</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">معرف الجلسة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المدة</TableHead>
                  <TableHead className="text-right">الصفحات</TableHead>
                  <TableHead className="text-right">النقرات</TableHead>
                  <TableHead className="text-right">الأحداث</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordings.map((recording) => (
                  <TableRow key={recording.id} className="hover:bg-gray-50">
                    <TableCell>
                      {recording.customer_name ? (
                        <div className="font-semibold text-gray-900">{recording.customer_name}</div>
                      ) : (
                        <span className="text-gray-400 italic">لم يكمل الطلب</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {recording.customer_phone ? (
                        <div className="font-mono text-sm" dir="ltr">{recording.customer_phone}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {recording.session_id.substring(0, 16)}...
                    </TableCell>
                    <TableCell>{formatDate(recording.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatDuration(recording.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {recording.page_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-gray-400" />
                        {recording.click_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>{recording.events.length}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => playRecording(recording)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        تشغيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Replay Player Dialog */}
      <Dialog open={!!selectedRecording} onOpenChange={(open) => !open && closePlayer()}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-right flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">
                  {selectedRecording?.customer_name || 'زائر غير معروف'}
                </div>
                {selectedRecording?.customer_phone && (
                  <div className="text-sm text-gray-500 font-normal mt-1" dir="ltr">
                    {selectedRecording.customer_phone}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 font-mono font-normal">
                {selectedRecording?.session_id.substring(0, 16)}...
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 pt-4">
            <div 
              id="replay-container" 
              className="w-full h-full bg-white rounded-lg border-2 border-gray-200 shadow-inner"
              style={{ minHeight: '600px' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
