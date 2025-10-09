'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const DatePicker = ({
  label,
  placeholder = 'Pick a date',
  value,
  onChange,
  className,
  disabled = false,
  minDate = new Date(),
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <span>{label}</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='w-full justify-between font-normal'
            disabled={disabled}
          >
            {value ? value.toLocaleDateString() : placeholder}
            <ChevronDownIcon className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={value}
            onSelect={date => {
              onChange(date);
              setOpen(false);
            }}
            disabled={date => date < minDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
