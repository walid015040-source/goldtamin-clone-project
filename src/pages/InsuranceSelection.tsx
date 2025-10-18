import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import tawuniyaLogo from "@/assets/tawuniya-logo.png";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";

const thirdPartyInsurance = [
  {
    id: 1,
    name: "شركة إتحاد الخليج الاهلية للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_9873f910cc224608b9d1b0007837a6a5~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9873f910cc224608b9d1b0007837a6a5~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 1707.90,
    salePrice: 853.95
  },
  {
    id: 2,
    name: "شركة المجموعة المتحدة للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات",
    originalPrice: 966.00,
    salePrice: 483.00
  },
  {
    id: 3,
    name: "شركة الاتحاد للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات",
    originalPrice: 822.30,
    salePrice: 411.15
  },
  {
    id: 4,
    name: "شركة التأمين العربية التعاونية",
    logo: "https://static.wixstatic.com/media/a4d98c_1e0c38a4a61348bcacf9a0bdf1c51479~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1e0c38a4a61348bcacf9a0bdf1c51479~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات",
    originalPrice: 1184.00,
    salePrice: 592.00
  },
  {
    id: 5,
    name: "شركة الجزيرة تكافل تعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_8976d5e542994c5499cec8fc13c0a246~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_8976d5e542994c5499cec8fc13c0a246~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 1614.00,
    salePrice: 807.00
  },
  {
    id: 6,
    name: "شركة المتوسط والخليج للتأمين (ميدغلف)",
    logo: "https://static.wixstatic.com/media/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png",
    discount: "خصم 20% لعدم وجود مطالبات",
    originalPrice: 1382.00,
    salePrice: 691.00
  },
  {
    id: 7,
    name: "الراجحي تكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_d4e7dc60346e4e81a1f3aeda42ef6896~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_d4e7dc60346e4e81a1f3aeda42ef6896~mv2.png",
    discount: "",
    originalPrice: 796.00,
    salePrice: 398.00
  },
  {
    id: 8,
    name: "شركة التعاونية للتأمين - يغطي إصلاح مركبتك",
    logo: "https://static.wixstatic.com/media/a4d98c_450384b2f0ee4a8aa21117e019e113fd~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_450384b2f0ee4a8aa21117e019e113fd~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات",
    originalPrice: 1176.00,
    salePrice: 588.00
  }
];

const comprehensiveInsurance = [
  {
    id: 1,
    name: "شركة التعاونية للتأمين",
    logo: tawuniyaLogo,
    discount: "",
    originalPrice: 1999.00,
    salePrice: 1499.00
  },
  {
    id: 2,
    name: "تأمين المركبات وافي سمارت – الراجحي تكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_99b70bfb782c45fc869bc94e2a4b21f3~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_99b70bfb782c45fc869bc94e2a4b21f3~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 1471.00,
    salePrice: 735.50
  },
  {
    id: 3,
    name: "شركة بروج للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_618ae961f5854eabb4222bf8217783af~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_618ae961f5854eabb4222bf8217783af~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 2051.00,
    salePrice: 899.00
  },
  {
    id: 4,
    name: "الشركة الخليجية العامة للتأمين",
    logo: "https://static.wixstatic.com/media/a4d98c_87bca84adf174fcb93b2002bddc2a63f~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_87bca84adf174fcb93b2002bddc2a63f~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 1015.00,
    salePrice: 939.00
  },
  {
    id: 5,
    name: "شركة ميد غولف للتأمين",
    logo: "https://static.wixstatic.com/media/a4d98c_6d65f436e14f463db8c9ec3c953a9708~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_6d65f436e14f463db8c9ec3c953a9708~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 2266.95,
    salePrice: 1133.48
  },
  {
    id: 6,
    name: "شركة تكافل الراجحي",
    logo: "https://static.wixstatic.com/media/a4d98c_c1540e762dba4775bc16c34ae137a95e~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_c1540e762dba4775bc16c34ae137a95e~mv2.png",
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 1616.00,
    salePrice: 808.00
  }
];

const InsuranceSelection = () => {
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();
  const [selectedTab, setSelectedTab] = useState("comprehensive");

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const handleBuyNow = async (company: any) => {
    // Update context
    updateOrderData({
      insuranceCompany: company.name,
      insurancePrice: company.salePrice,
    });

    // Update database
    try {
      if (orderData.sequenceNumber) {
        await supabase
          .from("customer_orders")
          .update({
            insurance_company: company.name,
            insurance_price: company.salePrice,
          })
          .eq("sequence_number", orderData.sequenceNumber);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }

    navigate(`/payment?company=${encodeURIComponent(company.name)}&price=${company.salePrice}&regularPrice=${company.originalPrice}`);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark py-16">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            اختر أفضل عرض تأمين لسيارتك
          </h1>
          <p className="text-xl text-white/90">
            قارن بين العروض واختر الأنسب لك
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="comprehensive" className="text-base">
              تأمين شامل
            </TabsTrigger>
            <TabsTrigger value="thirdParty" className="text-base">
              تأمين ضد الغير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprehensive">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {comprehensiveInsurance.map((company, index) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl shadow-medium hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6 animate-scale-in relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    خصم {calculateDiscount(company.originalPrice, company.salePrice)}%
                  </div>

                  <div className="mb-6">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="h-20 w-auto object-contain mx-auto mb-4"
                    />
                    <h3 className="text-lg font-bold text-foreground text-center">
                      {company.name}
                    </h3>
                  </div>

                  <div className="mb-6 text-center">
                    <div className="text-sm text-muted-foreground line-through mb-1">
                      سعر عادي {company.originalPrice.toFixed(2)}﷼
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      سعر البيع {company.salePrice.toFixed(2)}﷼
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-base bg-accent hover:bg-accent/90"
                    onClick={() => handleBuyNow(company)}
                  >
                    إشتري الآن
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="thirdParty">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {thirdPartyInsurance.map((company, index) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl shadow-medium hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6 animate-scale-in relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    خصم {calculateDiscount(company.originalPrice, company.salePrice)}%
                  </div>

                  <div className="mb-6">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="h-20 w-auto object-contain mx-auto mb-4"
                    />
                    <h3 className="text-lg font-bold text-foreground text-center">
                      {company.name}
                    </h3>
                  </div>

                  <div className="mb-6 text-center">
                    <div className="text-sm text-muted-foreground line-through mb-1">
                      سعر عادي {company.originalPrice.toFixed(2)}﷼
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      سعر البيع {company.salePrice.toFixed(2)}﷼
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-base bg-accent hover:bg-accent/90"
                    onClick={() => handleBuyNow(company)}
                  >
                    إشتري الآن
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default InsuranceSelection;
