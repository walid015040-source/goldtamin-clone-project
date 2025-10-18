import { Search, DollarSign, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "مقارنة شاملة",
    description: "نعرض لك جميع العروض المتاحة من كل شركات التأمين في مكان واحد",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: DollarSign,
    title: "أفضل الأسعار",
    description: "وفر المال واحصل على أفضل سعر مضمون دون الحاجة للبحث",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Zap,
    title: "سرعة وسهولة",
    description: "اشترِ وثيقة التأمين في دقائق معدودة من منزلك",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Shield,
    title: "موثوق ومعتمد",
    description: "نعمل مع جميع شركات التأمين المعتمدة من البنك المركزي",
    color: "from-purple-500 to-purple-600"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ليه تشتري وثيقة التأمين من تأميني؟
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ممكن صار لك موقف واشتريت وثيقة تأمين واكتشفت إن فيه عرض أفضل!
            <br />
            مع تأميني.. ما راح تتكرر لك هالتجربة!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-card-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
