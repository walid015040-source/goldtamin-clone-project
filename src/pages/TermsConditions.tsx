import Footer from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">الشروط والأحكام</h1>
          <p className="text-lg opacity-90">آخر تحديث: فبراير 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. القبول بالشروط</h2>
            <p>باستخدامك لمنصة تأميني، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة. نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. وصف الخدمة</h2>
            <p>تأميني هي منصة إلكترونية لمقارنة أسعار تأمين السيارات من شركات التأمين المعتمدة في المملكة العربية السعودية. نعمل كوسيط بينك وبين شركات التأمين لتسهيل عملية المقارنة والشراء. لا نقدم التأمين بشكل مباشر، بل نسهل الوصول إلى عروض شركات التأمين المرخصة.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. أهلية الاستخدام</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام خدماتنا</li>
              <li>يجب أن تكون مقيماً في المملكة العربية السعودية</li>
              <li>يجب أن تقدم معلومات صحيحة ودقيقة عند استخدام المنصة</li>
              <li>يجب أن تمتلك رخصة قيادة سارية المفعول</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. التزامات المستخدم</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>تقديم معلومات شخصية ومعلومات المركبة صحيحة ودقيقة</li>
              <li>عدم استخدام المنصة لأي غرض غير قانوني</li>
              <li>الحفاظ على سرية معلومات حسابك</li>
              <li>إبلاغنا فوراً عن أي استخدام غير مصرح به لحسابك</li>
              <li>عدم محاولة اختراق أو التلاعب بأنظمة المنصة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. الأسعار والدفع</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>الأسعار المعروضة هي أسعار تقريبية وقد تختلف بناءً على المعلومات النهائية</li>
              <li>السعر النهائي يحدده شركة التأمين بعد مراجعة جميع البيانات</li>
              <li>نقبل الدفع عبر بطاقات الائتمان، مدى، تمارا، وتابي</li>
              <li>جميع المدفوعات تتم بالريال السعودي</li>
              <li>لا يمكن استرداد المبالغ المدفوعة بعد إصدار وثيقة التأمين إلا وفقاً لسياسة شركة التأمين</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. وثيقة التأمين</h2>
            <p>بعد إتمام عملية الدفع بنجاح، سيتم إصدار وثيقة التأمين من قبل شركة التأمين المختارة. تأميني ليست طرفاً في عقد التأمين بينك وبين شركة التأمين. جميع المطالبات والشكاوى المتعلقة بالتغطية التأمينية يجب توجيهها مباشرة إلى شركة التأمين.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. إخلاء المسؤولية</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>لا نضمن دقة أو اكتمال المعلومات المقدمة من شركات التأمين</li>
              <li>لا نتحمل مسؤولية أي خسائر ناتجة عن استخدام المنصة</li>
              <li>لا نتحمل مسؤولية انقطاع الخدمة أو الأخطاء التقنية</li>
              <li>المنصة مقدمة "كما هي" دون أي ضمانات صريحة أو ضمنية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. حقوق الملكية الفكرية</h2>
            <p>جميع المحتويات على منصة تأميني، بما في ذلك النصوص والشعارات والتصاميم والبرمجيات، هي ملكية فكرية لتأميني ومحمية بموجب قوانين الملكية الفكرية في المملكة العربية السعودية. يُحظر نسخ أو توزيع أو تعديل أي محتوى دون إذن كتابي مسبق.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. القانون المطبق</h2>
            <p>تخضع هذه الشروط والأحكام لأنظمة المملكة العربية السعودية. في حال نشوء أي نزاع، يتم حله ودياً أولاً، وفي حال تعذر ذلك، يُحال إلى الجهات القضائية المختصة في المملكة العربية السعودية.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. التواصل</h2>
            <p>لأي استفسارات حول الشروط والأحكام، يرجى التواصل معنا عبر:</p>
            <p className="mt-2">البريد الإلكتروني: info@tamini.sa</p>
            <p>الهاتف: 920000000</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsConditions;
