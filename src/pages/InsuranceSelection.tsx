import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Shield, Star, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import tawuniyaLogo from "@/assets/tawuniya-logo.png";
import arabiaInsuranceLogo from "@/assets/arabia-insurance-logo.svg";
import amanaInsuranceLogo from "@/assets/amana-insurance-logo.svg";
import walaaInsuranceLogo from "@/assets/walaa-insurance-logo.svg";
import burujInsuranceLogo from "@/assets/buruj-insurance-logo.svg";
import arabianShieldLogo from "@/assets/arabian-shield-logo.svg";
import acigLogo from "@/assets/acig-logo.svg";
import aljazeeraTakafulLogo from "@/assets/aljazeera-takaful-logo.svg";
import alrajhiTakafulLogo from "@/assets/alrajhi-takaful-logo.svg";
import saicoLogo from "@/assets/saico-logo.svg";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceCompany {
  id: number;
  name: string;
  logo: string;
  discount: string;
  originalPrice: number;
  salePrice: number;
  features: string[];
  rating?: number;
}

const thirdPartyInsurance: InsuranceCompany[] = [
  {
    id: 1,
    name: "شركة التعاونية للتأمين",
    logo: tawuniyaLogo,
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 899.00,
    salePrice: 674.25,
    features: ["تغطية كاملة للطرف الثالث", "خدمة عملاء 24/7", "سرعة في معالجة المطالبات"],
    rating: 4.8
  },
  {
    id: 2,
    name: "شركة التأمين العربية التعاونية",
    logo: arabiaInsuranceLogo,
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 1184.00,
    salePrice: 852.48,
    features: ["تغطية شاملة", "تطبيق إلكتروني متقدم", "شبكة ورش معتمدة"],
    rating: 4.7
  },
  {
    id: 3,
    name: "شركة الجزيرة تكافل تعاوني",
    logo: aljazeeraTakafulLogo,
    discount: "خصم 26% لعدم وجود مطالبات",
    originalPrice: 1614.00,
    salePrice: 1194.36,
    features: ["حلول تكافلية", "مطابق للشريعة", "خصومات مميزة"],
    rating: 4.6
  },
  {
    id: 4,
    name: "الراجحي تكافل",
    logo: alrajhiTakafulLogo,
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 1692.00,
    salePrice: 1184.40,
    features: ["تأمين إسلامي", "خدمات رقمية", "عروض حصرية"],
    rating: 4.9
  },
  {
    id: 5,
    name: "شركة أمانة للتأمين التعاوني",
    logo: amanaInsuranceLogo,
    discount: "خصم 20% لعدم وجود مطالبات",
    originalPrice: 1320.00,
    salePrice: 1056.00,
    features: ["تأمين موثوق", "تعويضات سريعة", "شبكة واسعة"],
    rating: 4.5
  },
  {
    id: 6,
    name: "شركة ولاء للتأمين التعاوني",
    logo: walaaInsuranceLogo,
    discount: "خصم 18% لعدم وجود مطالبات",
    originalPrice: 1100.00,
    salePrice: 902.00,
    features: ["أسعار تنافسية", "خدمة مميزة", "تطبيق ذكي"],
    rating: 4.4
  },
  {
    id: 7,
    name: "شركة سلامة للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r~mv2.png",
    discount: "خصم 15% لعدم وجود مطالبات",
    originalPrice: 880.00,
    salePrice: 789.00,
    features: ["تأمين اقتصادي", "إجراءات مبسطة", "دعم فني"],
    rating: 4.3
  },
  {
    id: 8,
    name: "شركة أسيج للتأمين التعاوني",
    logo: acigLogo,
    discount: "خصم 22% لعدم وجود مطالبات",
    originalPrice: 920.00,
    salePrice: 717.60,
    features: ["تغطية موسعة", "خصومات مجمعة", "برنامج ولاء"],
    rating: 4.6
  },
  {
    id: 9,
    name: "شركة سايكو للتأمين التعاوني",
    logo: saicoLogo,
    discount: "خصم 20% لعدم وجود مطالبات",
    originalPrice: 1050.00,
    salePrice: 840.00,
    features: ["تأمين متكامل", "خدمة احترافية", "عروض موسمية"],
    rating: 4.5
  },
  {
    id: 10,
    name: "شركة الدرع العربي للتأمين التعاوني",
    logo: arabianShieldLogo,
    discount: "خصم 16% لعدم وجود مطالبات",
    originalPrice: 890.00,
    salePrice: 747.60,
    features: ["حماية شاملة", "استجابة سريعة", "ثقة وأمان"],
    rating: 4.4
  },
  {
    id: 11,
    name: "شركة بروج للتأمين التعاوني",
    logo: burujInsuranceLogo,
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 1150.00,
    salePrice: 862.50,
    features: ["تأمين مرن", "حلول مبتكرة", "أسعار منافسة"],
    rating: 4.6
  },
  {
    id: 12,
    name: "شركة العالمية للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 1299.00,
    salePrice: 765.00,
    features: ["عروض حصرية", "تغطية عالمية", "خدمة متميزة"],
    rating: 4.7
  },
  {
    id: 13,
    name: "شركة المتحدة للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png",
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 1150.00,
    salePrice: 828.00,
    features: ["خيارات متعددة", "دعم مستمر", "أسعار تنافسية"],
    rating: 4.5
  },
  {
    id: 14,
    name: "شركة الاتحاد للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png",
    discount: "خصم 32% لعدم وجود مطالبات",
    originalPrice: 980.00,
    salePrice: 666.40,
    features: ["تأمين شامل", "معالجة فورية", "شبكة واسعة"],
    rating: 4.6
  },
  {
    id: 15,
    name: "شركة ميدغلف للتأمين",
    logo: "https://static.wixstatic.com/media/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png",
    discount: "خصم 24% لعدم وجود مطالبات",
    originalPrice: 1100.00,
    salePrice: 836.00,
    features: ["تأمين صحي مجاني", "خدمة طوارئ", "تطبيق متطور"],
    rating: 4.7
  }
];

const comprehensiveInsurance: InsuranceCompany[] = [
  {
    id: 1,
    name: "شركة التعاونية للتأمين - شامل",
    logo: tawuniyaLogo,
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 1999.00,
    salePrice: 1499.00,
    features: ["تغطية شاملة للمركبة", "تغطية الطرف الثالث", "مساعدة على الطريق"],
    rating: 4.9
  },
  {
    id: 2,
    name: "تأمين المركبات وافي سمارت – الراجحي تكافل",
    logo: alrajhiTakafulLogo,
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 1471.00,
    salePrice: 956.15,
    features: ["تأمين إسلامي", "حماية كاملة", "سيارة بديلة"],
    rating: 4.8
  },
  {
    id: 3,
    name: "شركة بروج للتأمين التعاوني - شامل",
    logo: burujInsuranceLogo,
    discount: "خصم 33% لعدم وجود مطالبات",
    originalPrice: 2051.00,
    salePrice: 1374.17,
    features: ["تغطية الحوادث", "إصلاح بالوكالة", "تعويض سريع"],
    rating: 4.7
  },
  {
    id: 4,
    name: "شركة أسيج للتأمين التعاوني - شامل",
    logo: acigLogo,
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 2180.00,
    salePrice: 1526.00,
    features: ["حماية متقدمة", "خدمة VIP", "صيانة دورية"],
    rating: 4.6
  },
  {
    id: 5,
    name: "شركة التأمين العربية - شامل",
    logo: arabiaInsuranceLogo,
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 2200.00,
    salePrice: 1584.00,
    features: ["تأمين كامل", "ورش معتمدة", "قطع أصلية"],
    rating: 4.8
  },
  {
    id: 6,
    name: "شركة الجزيرة تكافل - شامل",
    logo: aljazeeraTakafulLogo,
    discount: "خصم 26% لعدم وجود مطالبات",
    originalPrice: 2350.00,
    salePrice: 1739.00,
    features: ["حلول تكافلية", "تغطية شاملة", "خدمات إضافية"],
    rating: 4.7
  },
  {
    id: 7,
    name: "شركة أمانة للتأمين - شامل",
    logo: amanaInsuranceLogo,
    discount: "خصم 22% لعدم وجود مطالبات",
    originalPrice: 2100.00,
    salePrice: 1638.00,
    features: ["حماية موثوقة", "دعم فني", "تطبيق ذكي"],
    rating: 4.5
  },
  {
    id: 8,
    name: "شركة ولاء للتأمين - شامل",
    logo: walaaInsuranceLogo,
    discount: "خصم 20% لعدم وجود مطالبات",
    originalPrice: 1950.00,
    salePrice: 1560.00,
    features: ["أسعار مميزة", "خدمة شاملة", "برنامج ولاء"],
    rating: 4.6
  },
  {
    id: 9,
    name: "شركة سايكو للتأمين - شامل",
    logo: saicoLogo,
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 2340.00,
    salePrice: 1755.00,
    features: ["تأمين متكامل", "عروض حصرية", "تعويض فوري"],
    rating: 4.7
  },
  {
    id: 10,
    name: "شركة الدرع العربي - شامل",
    logo: arabianShieldLogo,
    discount: "خصم 18% لعدم وجود مطالبات",
    originalPrice: 1920.00,
    salePrice: 1574.40,
    features: ["حماية كاملة", "شبكة واسعة", "استجابة سريعة"],
    rating: 4.5
  },
  {
    id: 11,
    name: "شركة المتحدة - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 2400.00,
    salePrice: 1680.00,
    features: ["تغطية ممتازة", "خدمة راقية", "ورش حديثة"],
    rating: 4.8
  },
  {
    id: 12,
    name: "شركة العالمية - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 2600.00,
    salePrice: 1690.00,
    features: ["عروض مميزة", "تغطية دولية", "خدمة VIP"],
    rating: 4.9
  },
  {
    id: 13,
    name: "شركة الاتحاد - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png",
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 2250.00,
    salePrice: 1620.00,
    features: ["تأمين شامل", "معالجة فورية", "ضمان شامل"],
    rating: 4.7
  },
  {
    id: 14,
    name: "شركة ميدغلف - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png",
    discount: "خصم 24% لعدم وجود مطالبات",
    originalPrice: 2150.00,
    salePrice: 1634.00,
    features: ["تأمين صحي مجاني", "خدمة متميزة", "تطبيق متطور"],
    rating: 4.6
  },
  {
    id: 15,
    name: "شركة سلامة - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r~mv2.png",
    discount: "خصم 15% لعدم وجود مطالبات",
    originalPrice: 1850.00,
    salePrice: 1572.50,
    features: ["تأمين موثوق", "إجراءات مبسطة", "دعم مستمر"],
    rating: 4.4
  }
];

const plusInsurance: InsuranceCompany[] = [
  {
    id: 1,
    name: "شركة التعاونية للتأمين - بلس",
    logo: tawuniyaLogo,
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 3499.00,
    salePrice: 2449.30,
    features: ["تغطية VIP شاملة", "سيارة بديلة فاخرة", "خدمة كونسيرج 24/7", "إصلاح في الوكالة"],
    rating: 5.0
  },
  {
    id: 2,
    name: "الراجحي تكافل - بلس",
    logo: alrajhiTakafulLogo,
    discount: "خصم 32% لعدم وجود مطالبات",
    originalPrice: 3200.00,
    salePrice: 2176.00,
    features: ["تأمين إسلامي متميز", "حماية كاملة للعائلة", "مساعدة طوارئ", "قطع غيار أصلية"],
    rating: 4.9
  },
  {
    id: 3,
    name: "شركة بروج للتأمين - بلس",
    logo: burujInsuranceLogo,
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 3400.00,
    salePrice: 2448.00,
    features: ["تغطية بريميوم", "ورش معتمدة حصرية", "تأمين شخصي للسائق", "خدمة غسيل مجانية"],
    rating: 4.8
  },
  {
    id: 4,
    name: "شركة التأمين العربية - بلس",
    logo: arabiaInsuranceLogo,
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 3600.00,
    salePrice: 2700.00,
    features: ["حماية بلاتينية", "سيارة بديلة فورية", "تأمين على الممتلكات", "خدمة سائق"],
    rating: 4.9
  },
  {
    id: 5,
    name: "شركة أسيج للتأمين - بلس",
    logo: acigLogo,
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 3300.00,
    salePrice: 2310.00,
    features: ["باقة VIP متكاملة", "تأمين صحي شامل", "تغطية دولية", "صيانة دورية مجانية"],
    rating: 4.8
  },
  {
    id: 6,
    name: "شركة الجزيرة تكافل - بلس",
    logo: aljazeeraTakafulLogo,
    discount: "خصم 27% لعدم وجود مطالبات",
    originalPrice: 3500.00,
    salePrice: 2555.00,
    features: ["تكافل بريميوم", "حماية عائلية شاملة", "خدمات حصرية", "برنامج مكافآت"],
    rating: 4.7
  },
  {
    id: 7,
    name: "شركة أمانة للتأمين - بلس",
    logo: amanaInsuranceLogo,
    discount: "خصم 22% لعدم وجود مطالبات",
    originalPrice: 3250.00,
    salePrice: 2535.00,
    features: ["تأمين متميز", "خدمة كونسيرج", "سيارة بديلة فاخرة", "تغطية إضافية"],
    rating: 4.6
  },
  {
    id: 8,
    name: "شركة ولاء للتأمين - بلس",
    logo: walaaInsuranceLogo,
    discount: "خصm 20% لعدم وجود مطالبات",
    originalPrice: 3100.00,
    salePrice: 2480.00,
    features: ["باقة بلاتينية", "خدمات راقية", "تطبيق ذكي متقدم", "خصومات حصرية"],
    rating: 4.7
  },
  {
    id: 9,
    name: "شركة الدرع العربي - بلس",
    logo: arabianShieldLogo,
    discount: "خصم 24% لعدم وجود مطالبات",
    originalPrice: 3400.00,
    salePrice: 2584.00,
    features: ["حماية قصوى", "استجابة فورية", "ورش حصرية", "تأمين شخصي"],
    rating: 4.8
  },
  {
    id: 10,
    name: "شركة سايكو للتأمين - بلس",
    logo: saicoLogo,
    discount: "خصم 26% لعدم وجود مطالبات",
    originalPrice: 3550.00,
    salePrice: 2627.00,
    features: ["تأمين فاخر", "عروض VIP", "تعويض فوري", "خدمات إضافية"],
    rating: 4.7
  },
  {
    id: 11,
    name: "شركة المتحدة - بلس",
    logo: "https://static.wixstatic.com/media/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 3800.00,
    salePrice: 2470.00,
    features: ["باقة بريميوم حصرية", "خدمة استثنائية", "ورش معتمدة فاخرة", "مكافآت سنوية"],
    rating: 4.9
  },
  {
    id: 12,
    name: "شركة العالمية - بلس",
    logo: "https://static.wixstatic.com/media/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png",
    discount: "خصم 34% لعدم وجود مطالبات",
    originalPrice: 3900.00,
    salePrice: 2574.00,
    features: ["تغطية عالمية VIP", "خدمة خمس نجوم", "سيارة بديلة فاخرة", "تأمين كامل للعائلة"],
    rating: 5.0
  },
  {
    id: 13,
    name: "شركة الاتحاد - بلس",
    logo: "https://static.wixstatic.com/media/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png",
    discount: "خصم 29% لعدم وجود مطالبات",
    originalPrice: 3450.00,
    salePrice: 2449.50,
    features: ["تأمين شامل بلس", "معالجة VIP", "ضمان ممتد", "خدمات حصرية"],
    rating: 4.8
  },
  {
    id: 14,
    name: "شركة ميدغلف - بلس",
    logo: "https://static.wixstatic.com/media/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png",
    discount: "خصم 23% لعدم وجود مطالبات",
    originalPrice: 3350.00,
    salePrice: 2579.50,
    features: ["تأمين صحي VIP", "خدمة مميزة جداً", "تطبيق متطور", "مساعدة طوارئ"],
    rating: 4.7
  },
  {
    id: 15,
    name: "شركة سلامة - بلس",
    logo: "https://static.wixstatic.com/media/a4d98c_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r~mv2.png",
    discount: "خصم 18% لعدم وجود مطالبات",
    originalPrice: 3150.00,
    salePrice: 2583.00,
    features: ["تأمين موثوق بلس", "إجراءات سريعة", "دعم مخصص", "ورش معتمدة"],
    rating: 4.6
  }
];

const InsuranceSelection = () => {
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrder();
  const [selectedTab, setSelectedTab] = useState("comprehensive");

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const handleBuyNow = async (company: InsuranceCompany) => {
    updateOrderData({
      insuranceCompany: company.name,
      insurancePrice: company.salePrice,
    });

    try {
      if (orderData.sequenceNumber) {
        const { error } = await supabase
          .from("customer_orders")
          .update({
            insurance_company: company.name,
            insurance_price: company.salePrice,
            updated_at: new Date().toISOString(),
          })
          .eq("sequence_number", orderData.sequenceNumber);
        
        if (error) {
          console.error("Error updating insurance:", error);
        }
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }

    navigate(`/payment?company=${encodeURIComponent(company.name)}&price=${company.salePrice}&regularPrice=${company.originalPrice}`);
  };

  const InsuranceCard = ({ company, index }: { company: InsuranceCompany; index: number }) => {
    const discountPercent = calculateDiscount(company.originalPrice, company.salePrice);
    
    return (
      <div
        className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 p-6 border border-gray-100 overflow-hidden animate-fade-in"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Discount Badge */}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="relative">
            <div className="bg-gradient-to-br from-accent via-accent-dark to-primary text-white font-bold px-6 py-3 rounded-full shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span className="text-lg">خصم {discountPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        {company.rating && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-700">{company.rating}</span>
          </div>
        )}

        {/* Logo Section */}
        <div className="mb-6 pt-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-shadow">
            <img 
              src={company.logo} 
              alt={company.name}
              className="h-24 w-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <h3 className="text-lg font-bold text-foreground text-center mt-4 line-clamp-2 min-h-[3.5rem]">
            {company.name}
          </h3>
        </div>

        {/* Features */}
        <div className="mb-6 space-y-2">
          {company.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* Price Section */}
        <div className="mb-6 text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground line-through">
              {company.originalPrice.toFixed(2)}﷼
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-primary">
              {company.salePrice.toFixed(2)}
            </span>
            <span className="text-xl text-primary">﷼</span>
          </div>
          <Badge variant="secondary" className="mt-2 bg-accent/20 text-accent-dark hover:bg-accent/30">
            وفر {(company.originalPrice - company.salePrice).toFixed(2)}﷼
          </Badge>
        </div>

        {/* Buy Button */}
        <Button 
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary-dark hover:from-primary-dark hover:via-accent-dark hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group"
          onClick={() => handleBuyNow(company)}
        >
          <span className="flex items-center gap-2">
            اشترِ الآن
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </span>
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-gray-50 to-background" dir="rtl">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-accent py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-block animate-scale-in">
            <Shield className="w-20 h-20 text-white mx-auto mb-6 drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in drop-shadow-lg">
            اختر أفضل تأمين لسيارتك
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto animate-fade-in drop-shadow-md" style={{ animationDelay: '0.1s' }}>
            قارن بين أكثر من 15 شركة تأمين واحصل على أفضل الأسعار مع خصومات تصل إلى 35%
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-lg px-6 py-3">
              <Award className="w-5 h-5 ml-2" />
              خصومات حصرية
            </Badge>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-lg px-6 py-3">
              <Star className="w-5 h-5 ml-2" />
              أفضل الأسعار
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-16 h-16 bg-white shadow-lg rounded-2xl p-2">
            <TabsTrigger 
              value="comprehensive" 
              className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Shield className="w-5 h-5 ml-2" />
              تأمين شامل
            </TabsTrigger>
            <TabsTrigger 
              value="thirdParty" 
              className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent-dark data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Check className="w-5 h-5 ml-2" />
              ضد الغير
            </TabsTrigger>
            <TabsTrigger 
              value="plus" 
              className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-dark data-[state=active]:to-accent data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Award className="w-5 h-5 ml-2" />
              تأمين بلس
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprehensive" className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">التأمين الشامل</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                تغطية شاملة لمركبتك ضد جميع المخاطر مع تغطية الطرف الثالث
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comprehensiveInsurance.map((company, index) => (
                <InsuranceCard key={company.id} company={company} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="thirdParty" className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">التأمين ضد الغير</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                تغطية إلزامية للمسؤولية تجاه الطرف الثالث بأفضل الأسعار
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {thirdPartyInsurance.map((company, index) => (
                <InsuranceCard key={company.id} company={company} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plus" className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-dark mb-3">
                التأمين بلس - الباقة المتميزة
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                أفضل تغطية تأمينية مع خدمات VIP حصرية وامتيازات إضافية
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <Badge variant="outline" className="text-base px-6 py-2 border-primary text-primary">
                  <Star className="w-4 h-4 ml-2 fill-primary" />
                  خدمة VIP
                </Badge>
                <Badge variant="outline" className="text-base px-6 py-2 border-accent text-accent">
                  <Award className="w-4 h-4 ml-2" />
                  امتيازات حصرية
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plusInsurance.map((company, index) => (
                <InsuranceCard key={company.id} company={company} index={index} />
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
