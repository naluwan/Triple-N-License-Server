import { format, setYear } from 'date-fns';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { zhTW } from 'date-fns/locale';

interface DatePickerProps {
  openDatePicker: boolean;
  setOpenDatePicker: (open: boolean) => void;
  defaultDate: Date | undefined;
  updateDate: (e: Date | undefined) => void;
  yearsRange?: number[];
}

const DatePicker: React.FC<DatePickerProps> = ({
  openDatePicker,
  setOpenDatePicker,
  defaultDate,
  updateDate,
  yearsRange,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(new Date());

  // 生成年份列表
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 51 }, (_, i) => currentYear - 25 + i);

  // 處理年份選擇
  const handleDateYearChange = (year: string) => {
    if (defaultDate) {
      const updatedDate = setYear(defaultDate, parseInt(year));
      setCurrentMonth(updatedDate);
      updateDate(updatedDate);
    }
  };

  React.useEffect(() => {
    if (defaultDate) {
      setCurrentMonth(defaultDate);
    }
  }, [defaultDate]);

  const currentYearsRange = yearsRange ? yearsRange : years;

  return (
    <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'mt-1 w-full justify-start text-left font-normal',
            !defaultDate && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4 md:h-7 md:w-7' />
          {defaultDate ? format(defaultDate, 'yyyy-MM-dd') : <span>請選擇日期</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='hide-scrollbar flex w-auto flex-col space-y-2 p-2'>
        {/* 年份選擇器 */}
        <Select
          value={currentMonth?.getFullYear().toString() ?? ''}
          onValueChange={handleDateYearChange}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='選擇年份' />
          </SelectTrigger>
          <SelectContent
            position='popper'
            className='z-[9999] max-h-[200px] overflow-y-auto bg-white shadow-lg'
          >
            {currentYearsRange.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 月份選擇器 */}
        <Select
          value={(currentMonth?.getMonth() ?? 0).toString()}
          onValueChange={(month) => {
            if (currentMonth) {
              const updated = new Date(currentMonth);
              updated.setMonth(parseInt(month));
              setCurrentMonth(updated);
              updateDate(updated);
            }
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='選擇月份' />
          </SelectTrigger>
          <SelectContent
            position='popper'
            className='z-[9999] max-h-[200px] overflow-y-auto bg-white shadow-lg'
          >
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {i + 1} 月
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 日曆選擇器 */}
        <div className='rounded-md border'>
          <Calendar
            mode='single'
            selected={defaultDate}
            onSelect={(e) => {
              updateDate(e);
              setOpenDatePicker(false);
            }}
            locale={zhTW}
            initialFocus
            month={currentMonth}
            onMonthChange={(e) => {
              setCurrentMonth(e);
              updateDate(e);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
