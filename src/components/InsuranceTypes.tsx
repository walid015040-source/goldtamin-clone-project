import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const insuranceTypes = [
  {
    title: "تأمين ضد الغير",
    subtitle: "التأمين الإلزامي الأساسي",
    price: "من 250 ريال/سنوياً",
    features: [
      "تغطية الأضرار التي تسببها للغير",
      "إلزامي لجميع المركبات",
      "يشمل تعويض الأضرار الجسدية",
      "يشمل تعويض الأضرار المادية"
    ],
    popular: false
  },
  {
    title: "تأمين شامل",
    subtitle: "التأمين الكامل والأفضل",
    price: "من 1,200 ريال/سنوياً",
    features: [
      "كل مزايا تأمين ضد الغير",
      "تغطية الأضرار التي تلحق بسيارتك",
      "تغطية الحوادث والسرقة",
      "خدمة المساعدة على الطريق",
      "سيارة بديلة عند الحاجة"
    ],
    popular: true
  }
];

const InsuranceTypes = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            إيش هي التغطية التأمينية اللي تختارها؟
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            فيه تغطيتين رئيسيتين يقدمها موقع تأميني
            <br />
            تقدر تختار واحدة منهم لتأمين سيارتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {insuranceTypes.map((type, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-medium hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in ${
                type.popular ? 'border-2 border-primary' : ''
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {type.popular && (
                <div className="absolute -top-4 right-8 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  الأكثر طلباً
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {type.title}
                </h3>
                <p className="text-muted-foreground mb-4">{type.subtitle}</p>
                <div className="text-3xl font-bold text-primary mb-2">
                  {type.price}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {type.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="bg-accent/10 rounded-full p-1 mt-0.5">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-card-foreground leading-relaxed flex-1">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full h-12 text-base font-semibold" 
                variant={type.popular ? "default" : "outline"}
                size="lg"
                onClick={() => {
                  const formElement = document.getElementById('registration-form');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                اختر هذا التأمين
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceTypes;
