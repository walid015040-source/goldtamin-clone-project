import madaLogo from "@/assets/mada-logo.png";
import visaLogo from "@/assets/visa-logo.png";

const PaymentLogos = () => {
  return (
    <div className="flex items-center gap-2 justify-end">
      {/* Visa Logo */}
      <div className="h-8 w-14 flex items-center justify-center bg-white rounded border border-gray-200 px-2 py-1">
        <img src={visaLogo} alt="Visa" className="w-full h-full object-contain" />
      </div>

      {/* Mastercard Logo */}
      <div className="h-8 w-12 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="18" cy="16" r="10" fill="#EB001B"/>
          <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
          <path d="M24 8a9.98 9.98 0 0 0-6 8 9.98 9.98 0 0 0 6 8 9.98 9.98 0 0 0 6-8 9.98 9.98 0 0 0-6-8z" fill="#FF5F00"/>
        </svg>
      </div>

      {/* Mada Logo */}
      <div className="h-8 w-16 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
        <img src={madaLogo} alt="مدي" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

export default PaymentLogos;
