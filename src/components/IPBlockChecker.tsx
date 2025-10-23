import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const IPBlockChecker = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip check for blocked page and admin pages
    if (location.pathname === "/access-blocked" || location.pathname.startsWith("/admin")) {
      return;
    }

    const checkIPBlock = async () => {
      try {
        // Get visitor's IP from tracking table (stored during visit)
        const sessionId = sessionStorage.getItem("visitor_session_id");
        
        if (!sessionId) return;

        const { data: visitor } = await supabase
          .from("visitor_tracking")
          .select("ip_address")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (!visitor?.ip_address) return;

        // Check if IP is blocked
        const { data: blockedIP } = await supabase
          .from("blocked_ips")
          .select("id")
          .eq("ip_address", visitor.ip_address)
          .maybeSingle();

        if (blockedIP) {
          navigate("/access-blocked", { replace: true });
        }
      } catch (error) {
        // Silently fail - don't block access on errors
        console.error("IP block check error:", error);
      }
    };

    checkIPBlock();
  }, [location.pathname, navigate]);

  return <>{children}</>;
};
