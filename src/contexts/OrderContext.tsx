import { createContext, useContext, useState, ReactNode } from "react";

interface OrderData {
  // Vehicle Info
  sequenceNumber?: string;
  vehicleType?: string;
  vehiclePurpose?: string;
  idNumber?: string;
  birthDate?: string;
  
  // Insurance Selection
  insuranceCompany?: string;
  insurancePrice?: number;
  
  // Payment Info
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
  
  // OTP
  otpCode?: string;
}

interface OrderContextType {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  clearOrderData: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orderData, setOrderData] = useState<OrderData>({});

  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  };

  const clearOrderData = () => {
    setOrderData({});
  };

  return (
    <OrderContext.Provider value={{ orderData, updateOrderData, clearOrderData }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};
