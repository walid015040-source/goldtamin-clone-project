import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const IPBlockChecker = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visitorIP, setVisitorIP] = useState<string | null>(null);

  const checkIfBlocked = useCallback(async (ip: string) => {
    try {
      const { data: blockedIP } = await supabase
        .from("blocked_ips")
        .select("id")
        .eq("ip_address", ip)
        .maybeSingle();

      if (blockedIP) {
        navigate("/access-blocked", { replace: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("IP block check error:", error);
      return false;
    }
  }, [navigate]);

  // Get visitor IP on mount
  useEffect(() => {
    const getVisitorIP = async () => {
      try {
        const sessionId = sessionStorage.getItem("visitor_session_id");
        if (!sessionId) return;

        const { data: visitor } = await supabase
          .from("visitor_tracking")
          .select("ip_address")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (visitor?.ip_address) {
          setVisitorIP(visitor.ip_address);
        }
      } catch (error) {
        console.error("Error getting visitor IP:", error);
      }
    };

    getVisitorIP();
  }, []);

  // Check IP block on route change and set up realtime subscription
  useEffect(() => {
    // Skip check for blocked page and admin pages
    if (location.pathname === "/access-blocked" || location.pathname.startsWith("/admin")) {
      return;
    }

    // Initial check
    if (visitorIP) {
      checkIfBlocked(visitorIP);
    }

    // Set up realtime subscription to blocked_ips table
    const channel = supabase
      .channel('blocked_ips_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blocked_ips'
        },
        (payload) => {
          // When a new IP is blocked, check if it's this visitor's IP
          const newBlockedIP = payload.new as { ip_address: string };
          if (visitorIP && newBlockedIP.ip_address === visitorIP) {
            navigate("/access-blocked", { replace: true });
          }
        }
      )
      .subscribe();

    // Also poll every 5 seconds as a backup
    const interval = setInterval(() => {
      if (visitorIP) {
        checkIfBlocked(visitorIP);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [location.pathname, navigate, visitorIP, checkIfBlocked]);

  return <>{children}</>;
};
