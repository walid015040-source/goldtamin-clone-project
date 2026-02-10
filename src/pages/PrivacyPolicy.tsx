import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-lg opacity-90">آخر تحديث: فبراير 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg" dir="rtl">
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">مقدمة</h2>
              <p>نحن في تأميني نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام منصتنا.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">المعلومات التي نجمعها</h2>
              <p>قد نقوم بجمع المعلومات التالية:</p>
              <ul className="list-disc pr-6 space-y-2 mt-3">
                <li>الاسم الكامل ورقم الهوية الوطنية أو الإقامة</li>
                <li>تاريخ الميلاد والعمر</li>
                <li>رقم الهاتف والبريد الإلكتروني</li>
                <li>معلومات المركبة (رقم اللوحة، نوع المركبة، سنة الصنع)</li>
                <li>معلومات الدفع (يتم معالجتها بشكل آمن عبر بوابات دفع معتمدة)</li>
                <li>عنوان IP ومعلومات المتصفح</li>
                <li>بيانات التصفح والاستخدام على المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">كيف نستخدم معلوماتك</h2>
              <ul className="list-disc pr-6 space-y-2">
                <li>تقديم عروض أسعار تأمين دقيقة ومخصصة لك</li>
                <li>إتمام عملية شراء وإصدار وثيقة التأمين</li>
                <li>التواصل معك بخصوص طلبك أو استفساراتك</li>
                <li>تحسين خدماتنا وتجربة المستخدم</li>
                <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
                <li>إرسال إشعارات ومعلومات مهمة حول وثيقتك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">حماية البيانات</h2>
              <p>نتخذ إجراءات أمنية صارمة لحماية بياناتك الشخصية، تشمل:</p>
              <ul className="list-disc pr-6 space-y-2 mt-3">
                <li>تشفير جميع البيانات المنقولة باستخدام بروتوكول SSL/TLS</li>
                <li>تخزين البيانات في خوادم آمنة ومحمية</li>
                <li>تقييد الوصول إلى البيانات الشخصية على الموظفين المخولين فقط</li>
                <li>مراجعة دورية لإجراءات الأمان والحماية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">مشاركة المعلومات</h2>
              <p>لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط مع:</p>
              <ul className="list-disc pr-6 space-y-2 mt-3">
                <li>شركات التأمين المعتمدة لغرض تقديم عروض الأسعار وإصدار الوثائق</li>
                <li>مزودي خدمات الدفع لمعالجة المدفوعات</li>
                <li>الجهات الحكومية عند الطلب وفقاً للأنظمة المعمول بها</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">ملفات تعريف الارتباط (Cookies)</h2>
              <p>نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك على منصتنا، وتذكر تفضيلاتك، وتحليل حركة المرور. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">حقوقك</h2>
              <ul className="list-disc pr-6 space-y-2">
                <li>الحق في الوصول إلى بياناتك الشخصية</li>
                <li>الحق في تصحيح أو تحديث بياناتك</li>
                <li>الحق في حذف بياناتك (وفقاً للشروط المعمول بها)</li>
                <li>الحق في الاعتراض على معالجة بياناتك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">تواصل معنا</h2>
              <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر:</p>
              <p className="mt-2">البريد الإلكتروني: info@tamini.sa</p>
              <p>الهاتف: 920000000</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
