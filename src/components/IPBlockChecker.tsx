import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const IPBlockChecker = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visitorIP, setVisitorIP] = useState<string | null>(null);

  const checkIfBlocked = useCallback(async (ip: string) => {
    try {
      // Use the security definer function to check if IP is blocked
      const { data: isBlocked, error } = await supabase
        .rpc('is_ip_blocked', { check_ip: ip });

      if (error) {
        console.error("Error checking IP block:", error);
        return false;
      }

      if (isBlocked) {
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

  // Check IP block on route change and poll regularly
  useEffect(() => {
    // Skip check for blocked page and admin pages
    if (location.pathname === "/access-blocked" || location.pathname.startsWith("/admin")) {
      return;
    }

    // Initial check
    if (visitorIP) {
      checkIfBlocked(visitorIP);
    }

    // Poll every 3 seconds to catch new blocks quickly
    const interval = setInterval(() => {
      if (visitorIP) {
        checkIfBlocked(visitorIP);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [location.pathname, navigate, visitorIP, checkIfBlocked]);

  return <>{children}</>;
};
