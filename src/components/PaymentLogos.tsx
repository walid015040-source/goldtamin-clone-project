import madaLogo from "@/assets/mada-logo.png";

const PaymentLogos = () => {
  return (
    <div className="flex items-center gap-2 justify-end">
      {/* Visa Logo */}
      <div className="h-8 w-12 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
        <svg viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M18.5 2.5L15 13.5h-3L14.5 2.5h3zm10 0l-5 11h-3l2.5-6-1-5h3.5l.5 3 3.5-3h3zm8 0c1.5 0 2.5 1 2.5 2.5v6c0 1.5-1 2.5-2.5 2.5h-5v-11h5zm-3 2v7h2c.5 0 1-.5 1-1v-5c0-.5-.5-1-1-1h-2zM8.5 2.5L5 13.5H2l5-11h1.5z" fill="#1A1F71"/>
        </svg>
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
