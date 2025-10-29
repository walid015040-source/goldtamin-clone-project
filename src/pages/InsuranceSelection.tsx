import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import tawuniyaLogo from "@/assets/tawuniya-logo.png";
import arabiaInsuranceLogo from "@/assets/arabia-insurance-logo.svg";
import amanaInsuranceLogo from "@/assets/amana-insurance-logo.svg";
import walaaInsuranceLogo from "@/assets/walaa-insurance-logo.svg";
import burujInsuranceLogo from "@/assets/buruj-insurance-logo.svg";
import arabianShieldLogo from "@/assets/arabian-shield-logo.svg";
import acigLogo from "@/assets/acig-logo.svg";
import aljazeeraTakafulLogo from "@/assets/aljazeera-takaful-logo.svg";
import { useOrder } from "@/contexts/OrderContext";
import { supabase } from "@/integrations/supabase/client";

const thirdPartyInsurance = [
  {
    id: 1,
    name: "شركة إتحاد الخليج الاهلية للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_9873f910cc224608b9d1b0007837a6a5~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9873f910cc224608b9d1b0007837a6a5~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 1707.90,
    salePrice: 1110.14
  },
  {
    id: 2,
    name: "شركة المجموعة المتحدة للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png",
    discount: "خصم 40% لعدم وجود مطالبات",
    originalPrice: 1492.00,
    salePrice: 895.00
  },
  {
    id: 3,
    name: "شركة الاتحاد للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png",
    discount: "خصم 52% لعدم وجود مطالبات",
    originalPrice: 1569.00,
    salePrice: 754.00
  },
  {
    id: 4,
    name: "شركة التأمين العربية التعاونية",
    logo: arabiaInsuranceLogo,
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 1184.00,
    salePrice: 852.48
  },
  {
    id: 5,
    name: "شركة الجزيرة تكافل تعاوني",
    logo: aljazeeraTakafulLogo,
    discount: "خصم 26% لعدم وجود مطالبات",
    originalPrice: 1614.00,
    salePrice: 1194.36
  },
  {
    id: 6,
    name: "شركة المتوسط والخليج للتأمين (ميدغلف)",
    logo: "https://static.wixstatic.com/media/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png",
    discount: "خصم 24% لعدم وجود مطالبات",
    originalPrice: 1382.00,
    salePrice: 1050.32
  },
  {
    id: 7,
    name: "الراجحي تكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_d4e7dc60346e4e81a1f3aeda42ef6896~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_d4e7dc60346e4e81a1f3aeda42ef6896~mv2.png",
    discount: "خصم 47% لعدم وجود مطالبات",
    originalPrice: 1692.00,
    salePrice: 899.00
  },
  {
    id: 8,
    name: "شركة التعاونية للتأمين - يغطي إصلاح مركبتك",
    logo: "https://static.wixstatic.com/media/a4d98c_450384b2f0ee4a8aa21117e019e113fd~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_450384b2f0ee4a8aa21117e019e113fd~mv2.png",
    discount: "خصم 33% لعدم وجود مطالبات",
    originalPrice: 1176.00,
    salePrice: 787.92
  },
  {
    id: 9,
    name: "شركة ساب تكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_5e7f8d40a8c94a3f9b2e1d6c3f4a5b6c~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5e7f8d40a8c94a3f9b2e1d6c3f4a5b6c~mv2.png",
    discount: "خصم 47% لعدم وجود مطالبات",
    originalPrice: 1498.00,
    salePrice: 792.00
  },
  {
    id: 10,
    name: "شركة أمانة للتأمين التعاوني",
    logo: amanaInsuranceLogo,
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 1320.00,
    salePrice: 950.40
  },
  {
    id: 11,
    name: "شركة ولاء للتأمين التعاوني",
    logo: walaaInsuranceLogo,
    discount: "خصم 26% لعدم وجود مطالبات",
    originalPrice: 1100.00,
    salePrice: 814.00
  },
  {
    id: 12,
    name: "شركة سلامة للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r~mv2.png",
    discount: "خصم 24% لعدم وجود مطالبات",
    originalPrice: 880.00,
    salePrice: 789.00
  },
  {
    id: 13,
    name: "شركة أسيج للتأمين التعاوني",
    logo: acigLogo,
    discount: "خصم 22% لعدم وجود مطالبات",
    originalPrice: 920.00,
    salePrice: 717.60
  },
  {
    id: 14,
    name: "شركة سايكو للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s~mv2.png",
    discount: "خصم 20% لعدم وجود مطالبات",
    originalPrice: 1050.00,
    salePrice: 840.00
  },
  {
    id: 15,
    name: "شركة أكسا التعاونية للتأمين",
    logo: "https://static.wixstatic.com/media/a4d98c_5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u~mv2.png",
    discount: "خصم 18% لعدم وجود مطالبات",
    originalPrice: 1280.00,
    salePrice: 1049.60
  },
  {
    id: 16,
    name: "شركة الدرع العربي للتأمين التعاوني",
    logo: arabianShieldLogo,
    discount: "خصم 16% لعدم وجود مطالبات",
    originalPrice: 890.00,
    salePrice: 747.60
  },
  {
    id: 17,
    name: "شركة الأهلي للتكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y~mv2.png",
    discount: "خصم 14% لعدم وجود مطالبات",
    originalPrice: 1020.00,
    salePrice: 877.20
  },
  {
    id: 18,
    name: "شركة وقاية للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a~mv2.png",
    discount: "خصم 12% لعدم وجود مطالبات",
    originalPrice: 1150.00,
    salePrice: 1012.00
  },
  {
    id: 19,
    name: "شركة عناية للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات",
    originalPrice: 1420.00,
    salePrice: 1278.00
  },
  {
    id: 20,
    name: "شركة الصقر للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e~mv2.png",
    discount: "خصم 8% لعدم وجود مطالبات",
    originalPrice: 840.00,
    salePrice: 772.80
  },
  {
    id: 21,
    name: "شركة ملاذ للتأمين وإعادة التأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g~mv2.png",
    discount: "خصم 7% لعدم وجود مطالبات",
    originalPrice: 1240.00,
    salePrice: 1153.20
  },
  {
    id: 22,
    name: "شركة سند للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i~mv2.png",
    discount: "خصم 15% لعدم وجود مطالبات",
    originalPrice: 980.00,
    salePrice: 833.00
  },
  {
    id: 23,
    name: "شركة سوليدرتي السعودية للتكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k~mv2.png",
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 1080.00,
    salePrice: 810.00
  },
  {
    id: 24,
    name: "شركة العالمية للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png",
    discount: "خصم 46% لعدم وجود مطالبات",
    originalPrice: 1299.00,
    salePrice: 765.00
  },
  {
    id: 25,
    name: "شركة الخليجية العامة للتأمين التعاوني",
    logo: "https://static.wixstatic.com/media/a4d98c_5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 1560.00,
    salePrice: 1014.00
  }
];

const comprehensiveInsurance = [
  {
    id: 1,
    name: "شركة التعاونية للتأمين",
    logo: tawuniyaLogo,
    discount: "خصم 25% لعدم وجود مطالبات",
    originalPrice: 1999.00,
    salePrice: 1499.00
  },
  {
    id: 2,
    name: "تأمين المركبات وافي سمارت – الراجحي تكافل",
    logo: "https://static.wixstatic.com/media/a4d98c_99b70bfb782c45fc869bc94e2a4b21f3~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_99b70bfb782c45fc869bc94e2a4b21f3~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 1471.00,
    salePrice: 956.15
  },
  {
    id: 3,
    name: "شركة بروج للتأمين التعاوني",
    logo: burujInsuranceLogo,
    discount: "خصم 33% لعدم وجود مطالبات",
    originalPrice: 2051.00,
    salePrice: 1374.17
  },
  {
    id: 4,
    name: "الشركة الخليجية العامة للتأمين",
    logo: "https://static.wixstatic.com/media/a4d98c_87bca84adf174fcb93b2002bddc2a63f~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_87bca84adf174fcb93b2002bddc2a63f~mv2.png",
    discount: "خصم 7% لعدم وجود مطالبات",
    originalPrice: 1015.00,
    salePrice: 943.95
  },
  {
    id: 5,
    name: "شركة ميد غولف للتأمين",
    logo: "https://static.wixstatic.com/media/a4d98c_6d65f436e14f463db8c9ec3c953a9708~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_6d65f436e14f463db8c9ec3c953a9708~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 2266.95,
    salePrice: 1473.52
  },
  {
    id: 6,
    name: "شركة تكافل الراجحي",
    logo: "https://static.wixstatic.com/media/a4d98c_c1540e762dba4775bc16c34ae137a95e~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_c1540e762dba4775bc16c34ae137a95e~mv2.png",
    discount: "خصم 34% لعدم وجود مطالبات",
    originalPrice: 1616.00,
    salePrice: 1066.56
  },
  {
    id: 7,
    name: "شركة أسيج للتأمين التعاوني - شامل",
    logo: acigLogo,
    discount: "خصم 33% لعدم وجود مطالبات",
    originalPrice: 2180.00,
    salePrice: 1460.60
  },
  {
    id: 8,
    name: "شركة سايكو للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات",
    originalPrice: 2340.00,
    salePrice: 1638.00
  },
  {
    id: 9,
    name: "شركة أكسا التعاونية للتأمين - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u~mv2.png",
    discount: "خصم 28% لعدم وجود مطالبات",
    originalPrice: 2520.00,
    salePrice: 1814.40
  },
  {
    id: 10,
    name: "شركة الدرع العربي للتأمين التعاوني - شامل",
    logo: arabianShieldLogo,
    discount: "خصم 26% لعدم وجود مطالبات",
    originalPrice: 1920.00,
    salePrice: 1420.80
  },
  {
    id: 11,
    name: "شركة الأهلي للتكافل - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y~mv2.png",
    discount: "خصم 24% لعدم وجود مطالبات",
    originalPrice: 2100.00,
    salePrice: 1596.00
  },
  {
    id: 12,
    name: "شركة وقاية للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a~mv2.png",
    discount: "خصم 22% لعدم وجود مطالبات",
    originalPrice: 2280.00,
    salePrice: 1778.40
  },
  {
    id: 13,
    name: "شركة عناية للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c~mv2.png",
    discount: "خصم 20% لعدم وجود مطالبات",
    originalPrice: 2620.00,
    salePrice: 2096.00
  },
  {
    id: 14,
    name: "شركة الصقر للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e~mv2.png",
    discount: "خصم 18% لعدم وجود مطالبات",
    originalPrice: 1880.00,
    salePrice: 1541.60
  },
  {
    id: 15,
    name: "شركة ملاذ للتأمين وإعادة التأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g~mv2.png",
    discount: "خصم 16% لعدم وجود مطالبات",
    originalPrice: 2400.00,
    salePrice: 2016.00
  },
  {
    id: 16,
    name: "شركة سند للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i~mv2.png",
    discount: "خصم 14% لعدم وجود مطالبات",
    originalPrice: 2040.00,
    salePrice: 1754.40
  },
  {
    id: 17,
    name: "شركة سوليدرتي السعودية للتكافل - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k~mv2.png",
    discount: "خصم 12% لعدم وجود مطالبات",
    originalPrice: 2220.00,
    salePrice: 1953.60
  },
  {
    id: 18,
    name: "شركة العالمية للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m~mv2.png",
    discount: "خصم 48% لعدم وجود مطالبات",
    originalPrice: 1892.00,
    salePrice: 976.00
  },
  {
    id: 19,
    name: "شركة اتحاد الخليج - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o~mv2.png",
    discount: "خصم 8% لعدم وجود مطالبات",
    originalPrice: 2720.00,
    salePrice: 2502.40
  },
  {
    id: 20,
    name: "شركة الجزيرة تكافل - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p~mv2.png",
    discount: "خصم 13% لعدم وجود مطالبات",
    originalPrice: 2460.00,
    salePrice: 2140.20
  },
  {
    id: 21,
    name: "شركة المجموعة المتحدة - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r~mv2.png",
    discount: "خصم 11% لعدم وجود مطالبات",
    originalPrice: 2160.00,
    salePrice: 1922.40
  },
  {
    id: 22,
    name: "شركة ساب تكافل - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t~mv2.png",
    discount: "خصم 9% لعدم وجود مطالبات",
    originalPrice: 1840.00,
    salePrice: 1674.40
  },
  {
    id: 23,
    name: "شركة ولاء للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v~mv2.png",
    discount: "خصم 6% لعدم وجود مطالبات",
    originalPrice: 2320.00,
    salePrice: 2180.80
  },
  {
    id: 24,
    name: "شركة سلامة للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x~mv2.png",
    discount: "خصم 5% لعدم وجود مطالبات",
    originalPrice: 2000.00,
    salePrice: 1900.00
  },
  {
    id: 25,
    name: "شركة أمانة للتأمين التعاوني - شامل",
    logo: "https://static.wixstatic.com/media/a4d98c_7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z~mv2.png",
    discount: "خصم 35% لعدم وجود مطالبات",
    originalPrice: 2800.00,
    salePrice: 1820.00
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
        } else {
          console.log("Insurance info updated successfully");
        }
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
