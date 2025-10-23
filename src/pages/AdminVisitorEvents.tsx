import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  FileText, 
  Navigation, 
  LogIn, 
  Clock,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisitorEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data: any;
  page_url: string;
  timestamp: string;
}

const AdminVisitorEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<VisitorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [sessions, setSessions] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, [filterType, selectedSession]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('visitor_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (filterType !== 'all') {
        query = query.eq('event_type', filterType);
      }

      if (selectedSession !== 'all') {
        query = query.eq('session_id', selectedSession);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setEvents(data || []);

      // Get unique sessions
      const uniqueSessions = [...new Set((data || []).map(e => e.session_id))];
      setSessions(uniqueSessions);
    } catch (error) {
      console.error('خطأ في جلب الأحداث:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'click': return <MousePointer className="w-4 h-4" />;
      case 'page_view': return <FileText className="w-4 h-4" />;
      case 'navigation': return <Navigation className="w-4 h-4" />;
      case 'form_submit': return <LogIn className="w-4 h-4" />;
      case 'input_focus': return <LogIn className="w-4 h-4" />;
      case 'page_exit': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getEventLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      click: 'نقر',
      page_view: 'عرض صفحة',
      navigation: 'تنقل',
      form_submit: 'إرسال نموذج',
      input_focus: 'تركيز حقل',
      page_exit: 'خروج من الصفحة',
    };
    return labels[type] || type;
  };

  const getEventDescription = (event: VisitorEvent) => {
    const data = event.event_data;
    
    switch (event.event_type) {
      case 'click':
        return `نقر على: ${data.text || data.element}`;
      case 'page_view':
        return `عرض: ${data.title || data.path}`;
      case 'navigation':
        return `انتقل إلى: ${data.to}`;
      case 'form_submit':
        return `إرسال نموذج: ${data.form_id}`;
      case 'input_focus':
        return `تركيز على: ${data.name} (${data.type})`;
      case 'page_exit':
        return `قضى ${data.time_spent} ثانية في الصفحة`;
      default:
        return JSON.stringify(data);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white text-gray-900 flex w-full" dir="rtl">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">تتبع أحداث الزوار 📊</h1>
              <p className="text-gray-600">شاهد كل ما يفعله الزوار في موقعك</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">نوع الحدث</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأحداث</SelectItem>
                  <SelectItem value="click">النقرات</SelectItem>
                  <SelectItem value="page_view">عرض الصفحات</SelectItem>
                  <SelectItem value="form_submit">إرسال النماذج</SelectItem>
                  <SelectItem value="input_focus">تركيز الحقول</SelectItem>
                  <SelectItem value="navigation">التنقل</SelectItem>
                  <SelectItem value="page_exit">الخروج</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">الجلسة</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الجلسات</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session.slice(-12)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل الأحداث...</p>
            </div>
          ) : events.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50 border-gray-200">
              <p className="text-gray-600">لا توجد أحداث مسجلة</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="p-4 bg-white border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        {getEventIcon(event.event_type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {getEventLabel(event.event_type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            جلسة: {event.session_id.slice(-8)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{getEventDescription(event)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.page_url}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.timestamp), 'HH:mm:ss', { locale: ar })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(event.timestamp), 'dd/MM/yyyy', { locale: ar })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminVisitorEvents;
