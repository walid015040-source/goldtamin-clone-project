import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">عن تأميني</h3>
            <p className="text-white/80 leading-relaxed">
              منصة مقارنة تأمين السيارات الرائدة في المملكة. نساعدك في الحصول على أفضل عروض التأمين بكل سهولة وشفافية.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-white/80 hover:text-white transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-white/80 hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-white/80 hover:text-white transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">خدماتنا</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  تأمين ضد الغير
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  تأمين شامل
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  نقل ملكية
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  مقارنة الأسعار
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <div className="flex gap-4 mb-4">
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-white/80 text-sm">
              البريد الإلكتروني: info@tamini.sa
              <br />
              الهاتف: 920000000
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/60">
          <p className="text-sm">
            © 2025 تأميني. جميع الحقوق محفوظة. | 
            <Link to="/privacy-policy" className="hover:text-white mx-2">سياسة الخصوصية</Link> | 
            <Link to="/terms-conditions" className="hover:text-white mx-2">الشروط والأحكام</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
