import Footer from "@/components/Footer";
import { Shield, Users, Target, Award } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">من نحن</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            تأميني هي المنصة الرائدة في المملكة العربية السعودية لمقارنة وشراء تأمين السيارات بكل سهولة وشفافية
          </p>
        </div>
      </div>

      {/* About Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mission */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">رسالتنا</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              نسعى في تأميني إلى تسهيل عملية البحث عن تأمين السيارات المناسب لكل عميل في المملكة العربية السعودية. نؤمن بأن كل شخص يستحق الحصول على أفضل تغطية تأمينية بأفضل سعر، ولذلك نعمل على توفير منصة شفافة وسهلة الاستخدام تمكنك من مقارنة العروض من أفضل شركات التأمين المعتمدة.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">قيمنا</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border rounded-xl p-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">الشفافية</h3>
                <p className="text-muted-foreground">نقدم لك جميع المعلومات بوضوح تام دون أي رسوم مخفية أو شروط غير واضحة</p>
              </div>
              <div className="bg-card border rounded-xl p-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">خدمة العملاء</h3>
                <p className="text-muted-foreground">فريق دعم متخصص جاهز لمساعدتك في أي وقت والإجابة على جميع استفساراتك</p>
              </div>
              <div className="bg-card border rounded-xl p-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">الدقة</h3>
                <p className="text-muted-foreground">نحرص على تقديم أسعار دقيقة ومحدثة من شركات التأمين المعتمدة في المملكة</p>
              </div>
              <div className="bg-card border rounded-xl p-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">الجودة</h3>
                <p className="text-muted-foreground">نتعاون فقط مع شركات التأمين المرخصة والمعتمدة من البنك المركزي السعودي</p>
              </div>
            </div>
          </section>

          {/* Why Us */}
          <section className="bg-muted/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">لماذا تأميني؟</h2>
            <ul className="space-y-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <span>مقارنة فورية بين أكثر من 15 شركة تأمين معتمدة</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <span>أسعار تنافسية وعروض حصرية لعملائنا</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <span>إصدار وثيقة التأمين فوراً بعد الدفع</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <span>خيارات دفع متعددة تشمل تمارا وتابي للتقسيط</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <span>دعم فني متواصل على مدار الساعة</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
