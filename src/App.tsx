import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "./contexts/OrderContext";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import Index from "./pages/Index";
import VehicleInfo from "./pages/VehicleInfo";
import InsuranceSelection from "./pages/InsuranceSelection";
import Payment from "./pages/Payment";
import ProcessingPayment from "./pages/ProcessingPayment";
import OtpVerification from "./pages/OtpVerification";
import OtpProcessing from "./pages/OtpProcessing";
import PaymentSuccess from "./pages/PaymentSuccess";
import TamaraLogin from "./pages/TamaraLogin";
import TamaraCheckout from "./pages/TamaraCheckout";
import TamaraPaymentProcessing from "./pages/TamaraPaymentProcessing";
import TabbyCheckout from "./pages/TabbyCheckout";
import TabbyOtpVerification from "./pages/TabbyOtpVerification";
import TabbyPayment from "./pages/TabbyPayment";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminTamaraPayments from "./pages/AdminTamaraPayments";

const queryClient = new QueryClient();

const App = () => {
  useVisitorTracking();
  
  return (
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
          <Route path="/otp-processing" element={<OtpProcessing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/tamara-login" element={<TamaraLogin />} />
          <Route path="/tamara-checkout" element={<TamaraCheckout />} />
          <Route path="/tamara-payment-processing" element={<TamaraPaymentProcessing />} />
          <Route path="/tabby-checkout" element={<TabbyCheckout />} />
          <Route path="/tabby-otp" element={<TabbyOtpVerification />} />
          <Route path="/tabby-payment" element={<TabbyPayment />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/tamara-payments" element={<AdminTamaraPayments />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
