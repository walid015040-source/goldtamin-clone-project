import { useVisitorStatus } from '@/hooks/useVisitorStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VisitorStatusIndicatorProps {
  sessionId: string | null | undefined;
}

export const VisitorStatusIndicator = ({ sessionId }: VisitorStatusIndicatorProps) => {
  const visitorStatus = useVisitorStatus(sessionId);

  // Don't show if there's no session ID at all
  if (!sessionId) {
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

  const isActive = visitorStatus?.is_active;
  const pageName = getPageName(visitorStatus?.page_url);

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
      <div className="relative flex items-center">
        {isActive ? (
          <>
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
          </>
        ) : (
          <div className="h-2.5 w-2.5 rounded-full bg-gray-400"></div>
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-[10px] font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? '🟢 متصل الآن' : '⚫ غير متصل'}
        </span>
        {isActive && (
          <span className="text-[9px] text-muted-foreground">
            📍 {pageName}
          </span>
        )}
      </div>
    </div>
  );
};
