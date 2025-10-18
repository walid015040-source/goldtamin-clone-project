import madaLogo from "@/assets/mada-logo.png";

const PaymentLogos = () => {
  return (
    <div className="flex items-center gap-2 justify-end">
      {/* Visa Logo */}
      <div className="h-8 w-14 flex items-center justify-center bg-white rounded border border-gray-200 px-2 py-1">
        <svg viewBox="0 0 141.7 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M60.5 6.2L48.7 39.8h-9.4L33 14.3c-.6-2.3-1.1-3.2-2.9-4.1-2.9-1.5-7.7-2.9-11.9-3.8l.3-1.4h20.5c2.6 0 5 1.7 5.6 4.7l5.1 27.1L62 6.2h9.5zM115 32.1c0-10.1-14-10.7-13.9-15.2.1-1.4 1.3-2.8 4.2-3.2 1.4-.2 5.4-.4 9.9 1.7l1.8-8.3c-2.4-.9-5.6-1.7-9.5-1.7-10 0-17 5.3-17.1 12.9-.1 5.6 5 8.7 8.8 10.6 3.9 1.9 5.2 3.1 5.2 4.8 0 2.6-3.1 3.8-6 3.8-5 0-7.7-1.3-10-2.4l-1.8 8.4c2.3 1 6.5 1.9 10.9 2 10.6 0 17.5-5.2 17.5-13.4M133 39.8h8.5L135 6.2h-7.8c-2.3 0-4.3 1.4-5.2 3.5L107.3 40h10l2-5.5h12.3l1.4 5.5zm-10.7-13.2l5.1-14 2.9 14h-8z" fill="#1A1F71"/>
          <path d="M82 6.2l-14.8 33.6h-9.9L72 6.2h10z" fill="#1A1F71"/>
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
