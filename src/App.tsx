import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "./contexts/OrderContext";
import Index from "./pages/Index";
import VehicleInfo from "./pages/VehicleInfo";
import InsuranceSelection from "./pages/InsuranceSelection";
import Payment from "./pages/Payment";
import ProcessingPayment from "./pages/ProcessingPayment";
import OtpVerification from "./pages/OtpVerification";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vehicle-info" element={<VehicleInfo />} />
          <Route path="/insurance-selection" element={<InsuranceSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/processing-payment" element={<ProcessingPayment />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
