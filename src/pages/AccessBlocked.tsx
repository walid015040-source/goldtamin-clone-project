import { Shield } from "lucide-react";

const AccessBlocked = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <Shield className="w-16 h-16 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            الوصول محظور
          </h1>
          <p className="text-lg text-muted-foreground">
            عذراً، تم حظر عنوان IP الخاص بك من الوصول إلى هذا الموقع
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 text-right space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>إذا كنت تعتقد أن هذا خطأ:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mr-4">
            <li>• تواصل مع إدارة الموقع</li>
            <li>• تحقق من اتصالك بالإنترنت</li>
            <li>• حاول استخدام شبكة أخرى</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessBlocked;