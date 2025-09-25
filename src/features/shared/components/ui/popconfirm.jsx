import * as React from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const Popconfirm = React.forwardRef(
  (
    {
      children,
      title,
      description,
      onConfirm,
      onCancel,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmVariant = 'destructive',
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleConfirm = () => {
      onConfirm?.();
      setOpen(false);
    };

    const handleCancel = () => {
      onCancel?.();
      setOpen(false);
    };

    const handleTriggerClick = e => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    };

    return (
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          {React.cloneElement(children, {
            onClick: handleTriggerClick,
          })}
        </PopoverTrigger>
        <PopoverContent className='w-80' align='end'>
          <div className='space-y-3'>
            <div className='space-y-2'>
              {title && <h4 className='font-medium leading-none'>{title}</h4>}
              {description && (
                <p className='text-sm text-muted-foreground'>{description}</p>
              )}
            </div>
            <div className='flex justify-end space-x-2'>
              <Button variant='outline' size='sm' onClick={handleCancel}>
                {cancelText}
              </Button>
              <Button
                variant={confirmVariant}
                size='sm'
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

Popconfirm.displayName = 'Popconfirm';

export { Popconfirm };
