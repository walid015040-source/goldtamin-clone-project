import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
          playNotificationSound();
          toast.success('طلب جديد!', {
            description: `تم استلام طلب جديد من ${payload.new.customer_name || 'عميل'}`,
            duration: 5000,
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
          toast.success('دفعة تمارة جديدة!', {
            description: `دفعة جديدة بمبلغ ${payload.new.amount || '0'} ريال`,
            duration: 5000,
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
          toast.success('دفعة تابي جديدة!', {
            description: `دفعة جديدة بمبلغ ${payload.new.amount || '0'} ريال`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(tamaraChannel);
      supabase.removeChannel(tabbyChannel);
    };
  }, [location.pathname]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('Error playing notification sound:', error);
      });
    }
  };

  return null;
};
