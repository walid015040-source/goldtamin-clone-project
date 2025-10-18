import { useState } from "react";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

const insuranceCompanies = [
  {
    id: 1,
    name: "شركة التعاونية للتأمين",
    logo: "🛡️",
    rating: 4.5,
    comprehensive: {
      price: 1850,
      features: [
        "تغطية شاملة ضد جميع الأخطار",
        "تغطية الحوادث والسرقة",
        "سيارة بديلة لمدة 15 يوم",
        "مساعدة على الطريق 24/7",
        "إصلاح في الوكالة"
      ]
    },
    thirdParty: {
      price: 450,
      features: [
        "تغطية أضرار الطرف الثالث",
        "إلزامي قانوني",
        "تعويضات الأضرار الجسدية",
        "تعويضات الأضرار المادية"
      ]
    }
  },
  {
    id: 2,
    name: "شركة الراجحي للتأمين",
    logo: "🏦",
    rating: 4.7,
    comprehensive: {
      price: 1750,
      features: [
        "تغطية شاملة ضد جميع الأخطار",
        "تغطية الحوادث والسرقة",
        "سيارة بديلة لمدة 20 يوم",
        "مساعدة على الطريق 24/7",
        "إصلاح في الوكالة"
      ]
    },
    thirdParty: {
      price: 420,
      features: [
        "تغطية أضرار الطرف الثالث",
        "إلزامي قانوني",
        "تعويضات الأضرار الجسدية",
        "تعويضات الأضرار المادية"
      ]
    }
  },
  {
    id: 3,
    name: "شركة ملاذ للتأمين",
    logo: "🏛️",
    rating: 4.3,
    comprehensive: {
      price: 1950,
      features: [
        "تغطية شاملة ضد جميع الأخطار",
        "تغطية الحوادث والسرقة",
        "سيارة بديلة لمدة 10 يوم",
        "مساعدة على الطريق 24/7",
        "إصلاح في الوكالة"
      ]
    },
    thirdParty: {
      price: 480,
      features: [
        "تغطية أضرار الطرف الثالث",
        "إلزامي قانوني",
        "تعويضات الأضرار الجسدية",
        "تعويضات الأضرار المادية"
      ]
    }
  },
  {
    id: 4,
    name: "شركة سلامة للتأمين",
    logo: "🛡️",
    rating: 4.6,
    comprehensive: {
      price: 1800,
      features: [
        "تغطية شاملة ضد جميع الأخطار",
        "تغطية الحوادث والسرقة",
        "سيارة بديلة لمدة 14 يوم",
        "مساعدة على الطريق 24/7",
        "إصلاح في الوكالة"
      ]
    },
    thirdParty: {
      price: 440,
      features: [
        "تغطية أضرار الطرف الثالث",
        "إلزامي قانوني",
        "تعويضات الأضرار الجسدية",
        "تعويضات الأضرار المادية"
      ]
    }
  }
];

const InsuranceSelection = () => {
  const [selectedTab, setSelectedTab] = useState("comprehensive");

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
              {insuranceCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl shadow-medium hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{company.logo}</div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-muted-foreground">
                            {company.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {company.comprehensive.price} ريال
                      <span className="text-base text-muted-foreground font-normal mr-2">
                        / سنوياً
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {company.comprehensive.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="bg-accent/10 rounded-full p-1 mt-0.5">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-sm text-foreground flex-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full h-12 text-base">
                    اختر هذا العرض
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="thirdParty">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {insuranceCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl shadow-medium hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{company.logo}</div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-muted-foreground">
                            {company.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {company.thirdParty.price} ريال
                      <span className="text-base text-muted-foreground font-normal mr-2">
                        / سنوياً
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {company.thirdParty.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="bg-accent/10 rounded-full p-1 mt-0.5">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-sm text-foreground flex-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full h-12 text-base">
                    اختر هذا العرض
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
