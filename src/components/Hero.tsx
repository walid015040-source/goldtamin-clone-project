import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const Hero = () => {
  return (
    <div className="relative min-h-[600px] bg-gradient-to-b from-primary to-primary-dark overflow-hidden">
      {/* Curved Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L1440 0L1440 120C1440 120 1080 40 720 40C360 40 0 120 0 120L0 0Z" fill="white"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Shield Icon */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border-2 border-white/20 shadow-lg">
            <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            اشترِ <span className="text-accent">تأمين سيارتك</span>
            <br />
            في دقائق معدودة
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            قارن بين عروض جميع شركات التأمين واختر الأنسب لك بأفضل سعر
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <Tabs defaultValue="new" dir="rtl" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="new" className="text-base">تأمين جديد</TabsTrigger>
                <TabsTrigger value="transfer" className="text-base">نقل ملكية</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="id-number" className="text-base">رقم الهوية / الإقامة الخاص بك</Label>
                  <Input 
                    id="id-number" 
                    type="text" 
                    placeholder=""
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner-name" className="text-base">اسم مالك الوثيقة كاملاً</Label>
                  <Input 
                    id="owner-name" 
                    type="text" 
                    placeholder=""
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">رقم الهاتف</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="05xxxxxxxx"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="text-base">تاريخ الميلاد</Label>
                  <Input 
                    id="birthdate" 
                    type="date" 
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">نوع البطاقة</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 text-base">استمارة</Button>
                    <Button variant="outline" className="h-12 text-base">بطاقة جمركية</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial" className="text-base">الرقم التسلسلي / بطاقة جمركية</Label>
                  <Input 
                    id="serial" 
                    type="text" 
                    placeholder="000000000"
                    className="h-12 text-base text-center"
                  />
                </div>

                <div className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    أوافق على منح شركة عناية الوسيط الحق في الاستعلام من شركة نجم و/أو مركز المعلومات الوطني عن بياناتي
                  </label>
                </div>

                <Button className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90" size="lg">
                  التالي
                </Button>
              </TabsContent>

              <TabsContent value="transfer" className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="transfer-id-number" className="text-base">رقم الهوية / الإقامة الخاص بك</Label>
                  <Input 
                    id="transfer-id-number" 
                    type="text" 
                    placeholder=""
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-owner-name" className="text-base">اسم مالك الوثيقة كاملاً</Label>
                  <Input 
                    id="transfer-owner-name" 
                    type="text" 
                    placeholder=""
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-phone" className="text-base">رقم الهاتف</Label>
                  <Input 
                    id="transfer-phone" 
                    type="tel" 
                    placeholder="05xxxxxxxx"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-birthdate" className="text-base">تاريخ الميلاد</Label>
                  <Input 
                    id="transfer-birthdate" 
                    type="date" 
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">نوع البطاقة</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 text-base">استمارة</Button>
                    <Button variant="outline" className="h-12 text-base">بطاقة جمركية</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-serial" className="text-base">الرقم التسلسلي / بطاقة جمركية</Label>
                  <Input 
                    id="transfer-serial" 
                    type="text" 
                    placeholder="000000000"
                    className="h-12 text-base text-center"
                  />
                </div>

                <div className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox id="transfer-terms" />
                  <label
                    htmlFor="transfer-terms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    أوافق على منح شركة عناية الوسيط الحق في الاستعلام من شركة نجم و/أو مركز المعلومات الوطني عن بياناتي
                  </label>
                </div>

                <Button className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90" size="lg">
                  التالي
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
