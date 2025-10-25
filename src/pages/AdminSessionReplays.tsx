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
      const { data, error } = await supabase
        .from('session_recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Fetch customer info for each recording
      const recordingsWithCustomers = await Promise.all(
        (data || []).map(async (recording) => {
          // Get customer info from orders table using session_id
          const { data: orderData } = await supabase
            .from('customer_orders')
            .select('owner_name, phone_number')
            .eq('visitor_session_id', recording.session_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...recording,
            events: recording.events as RRwebEvent[],
            duration: recording.duration as number | null,
            page_count: recording.page_count as number | null,
            click_count: recording.click_count as number | null,
            customer_name: orderData?.owner_name || null,
            customer_phone: orderData?.phone_number || null,
          };
        })
      );
      
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
        const replayer = new Replayer(selectedRecording.events, {
          root: container,
          skipInactive: true,
          showWarning: true,
          showDebug: false,
          speed: 1,
        });
        
        setReplayerInstance(replayer);
        replayer.play();
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
                  <TableHead className="text-right">اسم العميل</TableHead>
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
                        <div>
                          <div className="font-medium">{recording.customer_name}</div>
                          {recording.customer_phone && (
                            <div className="text-xs text-gray-500" dir="ltr">{recording.customer_phone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">غير متوفر</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {recording.session_id.substring(0, 20)}...
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
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-right">
              تشغيل تسجيل الجلسة: {selectedRecording?.session_id.substring(0, 20)}...
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 pt-0">
            <div 
              id="replay-container" 
              className="w-full h-full bg-gray-100 rounded-lg border border-gray-300"
              style={{ minHeight: '600px' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
