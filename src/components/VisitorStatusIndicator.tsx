import { useVisitorStatus } from '@/hooks/useVisitorStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VisitorStatusIndicatorProps {
  sessionId: string | null | undefined;
}

export const VisitorStatusIndicator = ({ sessionId }: VisitorStatusIndicatorProps) => {
  const visitorStatus = useVisitorStatus(sessionId);

  if (!visitorStatus?.is_active) {
    return null;
  }

  const getPageName = (url: string | null) => {
    if (!url) return 'غير معروف';
    
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Map paths to Arabic names
      const pathMap: Record<string, string> = {
        '/': 'الصفحة الرئيسية',
        '/insurance-selection': 'اختيار التأمين',
        '/vehicle-info': 'معلومات المركبة',
        '/payment': 'صفحة الدفع',
        '/tamara-login': 'تمارا - تسجيل الدخول',
        '/tamara-checkout': 'تمارا - الدفع',
        '/tamara-payment-processing': 'تمارا - معالجة الدفع',
        '/tabby-checkout': 'تابي - تسجيل الدخول',
        '/tabby-payment': 'تابي - الدفع',
        '/tabby-payment-processing': 'تابي - معالجة الدفع',
        '/otp-verification': 'التحقق من OTP',
        '/payment-success': 'نجاح الدفع',
      };

      return pathMap[path] || path;
    } catch {
      return 'غير معروف';
    }
  };

  const pageName = getPageName(visitorStatus.page_url);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs text-green-600 font-medium hidden md:inline">
              متصل
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white">
          <div className="text-xs">
            <p className="font-bold mb-1">العميل نشط الآن</p>
            <p className="text-gray-300">الصفحة: {pageName}</p>
            {visitorStatus.last_active_at && (
              <p className="text-gray-400 mt-1">
                آخر نشاط: {new Date(visitorStatus.last_active_at).toLocaleTimeString('ar-EG')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
