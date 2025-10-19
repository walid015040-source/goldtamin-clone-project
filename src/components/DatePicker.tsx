import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  allowFutureDates?: boolean;
  placeholder?: string;
}

const months = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const DatePicker = ({ label, value, onChange, allowFutureDates = false, placeholder = "اختر التاريخ" }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(value || new Date());
  
  const currentYear = new Date().getFullYear();
  const maxYear = allowFutureDates ? currentYear + 10 : currentYear;
  const years = Array.from({ length: maxYear - 1900 + 1 }, (_, i) => maxYear - i);

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(parseInt(monthIndex));
    setDisplayMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(year));
    setDisplayMonth(newDate);
  };

  return (
    <div className="space-y-2">
      <Label className="text-base">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 text-base justify-start text-right font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {value ? format(value, "PPP", { locale: ar }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b flex gap-2" dir="rtl">
            <Select
              value={displayMonth.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={displayMonth.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            disabled={(date) =>
              allowFutureDates 
                ? date < new Date("1900-01-01")
                : date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
          
          <div className="p-3 border-t">
            <Button 
              className="w-full" 
              onClick={() => setOpen(false)}
              disabled={!value}
            >
              موافق
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
