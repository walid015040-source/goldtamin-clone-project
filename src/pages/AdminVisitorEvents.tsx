import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MousePointer, 
  FileText, 
  Navigation, 
  LogIn, 
  Clock,
  User,
  Globe,
  ExternalLink,
  MapPin,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VisitorEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data: any;
  page_url: string;
  timestamp: string;
}

interface VisitorSession {
  session_id: string;
  ip_address: string | null;
  source: string;
  user_agent: string | null;
  created_at: string;
  last_active_at: string;
  is_active: boolean;
  page_url: string | null;
  events: VisitorEvent[];
}

const AdminVisitorEvents = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VisitorSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchSessions();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const fetchSessions = async () => {
    try {
      // Get all visitor tracking records
      const { data: trackingData, error: trackingError } = await supabase
        .from('visitor_tracking')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (trackingError) throw trackingError;

      // Get events for each session
      const sessionsWithEvents = await Promise.all(
        (trackingData || []).map(async (tracking) => {
          const { data: events } = await supabase
            .from('visitor_events')
            .select('*')
            .eq('session_id', tracking.session_id)
            .order('timestamp', { ascending: true });

          return {
            ...tracking,
            events: events || []
          };
        })
      );

      setSessions(sessionsWithEvents);
      if (sessionsWithEvents.length > 0) {
        setSelectedSession(sessionsWithEvents[0]);
      }
    } catch (error) {
      console.error('خطأ في جلب الجلسات:', error);
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

  const getPageName = (url: string) => {
    if (url.includes('/insurance-selection')) return 'اختيار التأمين';
    if (url.includes('/vehicle-info')) return 'معلومات المركبة';
    if (url.includes('/payment')) return 'صفحة الدفع';
    if (url.includes('/tabby')) return 'دفع تابي';
    if (url.includes('/tamara')) return 'دفع تمارا';
    if (url === '/' || url === '') return 'الصفحة الرئيسية';
    return url;
  };

  const getSourceLabel = (source: string) => {
    const labels: { [key: string]: string } = {
      direct: 'مباشر',
      google: 'جوجل',
      facebook: 'فيسبوك',
      instagram: 'انستقرام',
      twitter: 'تويتر',
    };
    return labels[source] || source;
  };

  const getFirstPage = (events: VisitorEvent[]) => {
    const pageView = events.find(e => e.event_type === 'page_view');
    return pageView ? getPageName(pageView.page_url) : 'غير محدد';
  };

  const getLastPage = (events: VisitorEvent[]) => {
    const exitEvent = [...events].reverse().find(e => e.event_type === 'page_exit' || e.event_type === 'page_view');
    return exitEvent ? getPageName(exitEvent.page_url) : 'غير محدد';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white text-gray-900 flex w-full" dir="rtl">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">تتبع رحلات الزوار 🎯</h1>
            <p className="text-gray-600">تابع كل زائر وشاهد رحلته الكاملة داخل الموقع</p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center bg-gray-50 border-gray-200">
                <p className="text-gray-600">لا توجد جلسات مسجلة</p>
              </Card>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Sessions List */}
              <div className="w-80 border-l border-gray-200 bg-gray-50">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {sessions.map((session) => (
                      <Card
                        key={session.session_id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedSession?.session_id === session.session_id
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            <Badge variant={session.is_active ? 'default' : 'secondary'} className="text-xs">
                              {session.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {session.events.length} حدث
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span className="truncate">{session.ip_address || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ExternalLink className="w-4 h-4" />
                            <span>{getSourceLabel(session.source)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Session Details */}
              <div className="flex-1 overflow-hidden">
                {selectedSession ? (
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-6">
                      {/* Visitor Info Card */}
                      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                          <User className="w-5 h-5" />
                          معلومات الزائر
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">عنوان IP</p>
                            <p className="text-gray-900 font-medium">{selectedSession.ip_address || 'غير محدد'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">المصدر</p>
                            <p className="text-gray-900 font-medium">{getSourceLabel(selectedSession.source)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">أول صفحة</p>
                            <p className="text-gray-900 font-medium">{getFirstPage(selectedSession.events)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">آخر صفحة</p>
                            <p className="text-gray-900 font-medium">{getLastPage(selectedSession.events)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">بداية الجلسة</p>
                            <p className="text-gray-900 font-medium">
                              {format(new Date(selectedSession.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ar })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">آخر نشاط</p>
                            <p className="text-gray-900 font-medium">
                              {format(new Date(selectedSession.last_active_at), 'dd/MM/yyyy HH:mm:ss', { locale: ar })}
                            </p>
                          </div>
                        </div>
                        {selectedSession.user_agent && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">المتصفح</p>
                            <p className="text-xs text-gray-700 break-all">{selectedSession.user_agent}</p>
                          </div>
                        )}
                      </Card>

                      {/* Journey Timeline */}
                      <Card className="p-6 border-gray-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                          <Activity className="w-5 h-5" />
                          رحلة الزائر ({selectedSession.events.length} حدث)
                        </h2>
                        
                        {selectedSession.events.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">لا توجد أحداث مسجلة لهذه الجلسة</p>
                        ) : (
                          <div className="space-y-4">
                            {selectedSession.events.map((event, index) => (
                              <div key={event.id} className="relative">
                                {index !== selectedSession.events.length - 1 && (
                                  <div className="absolute right-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                                )}
                                <div className="flex gap-4">
                                  <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white">
                                    {getEventIcon(event.event_type)}
                                  </div>
                                  
                                  <div className="flex-1 pb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className="text-xs">
                                        {getEventLabel(event.event_type)}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(event.timestamp), 'HH:mm:ss', { locale: ar })}
                                      </span>
                                    </div>
                                    
                                    <Card className="p-3 bg-gray-50 border-gray-200">
                                      <p className="text-sm text-gray-900 mb-1 font-medium">
                                        {getEventDescription(event)}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{getPageName(event.page_url)}</span>
                                      </div>
                                    </Card>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">اختر جلسة لعرض التفاصيل</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminVisitorEvents;
