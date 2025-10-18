import { Check, ChevronsUpDown, Search } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover';
import { ScrollArea } from '@/features/shared/components/ui/scroll-area';
import { cn } from '@/features/shared/lib/utils';

export const Combobox = ({
  options = [],
  value,
  onValueChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  className,
  disabled = false,
  renderOption,
  renderSelected,
}) => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedOption = React.useMemo(
    () => options.find(option => option.value === value),
    [options, value]
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(
      option =>
        option.label?.toLowerCase().includes(query) ||
        option.searchText?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSelect = currentValue => {
    onValueChange(currentValue === value ? '' : currentValue);
    setOpen(false);
    setSearchQuery('');
  };

  const defaultRenderOption = option => option.label;
  const defaultRenderSelected = option => option?.label || placeholder;

  const optionRenderer = renderOption || defaultRenderOption;
  const selectedRenderer = renderSelected || defaultRenderSelected;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className='truncate'>{selectedRenderer(selectedOption)}</span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <div className='flex items-center border-b px-3 py-2'>
          <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='border-0 px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0'
          />
        </div>
        <ScrollArea className='max-h-[300px]'>
          {filteredOptions.length === 0 ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              {emptyText}
            </div>
          ) : (
            <div className='p-1'>
              {filteredOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'transition-colors',
                    value === option.value && 'bg-accent'
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {optionRenderer(option)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
