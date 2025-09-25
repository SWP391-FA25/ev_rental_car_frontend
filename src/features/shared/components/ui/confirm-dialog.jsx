import * as React from 'react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

const ConfirmDialog = React.forwardRef(
  (
    {
      open,
      onOpenChange,
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
    const handleConfirm = () => {
      onConfirm?.();
      onOpenChange?.(false);
    };

    const handleCancel = () => {
      onCancel?.();
      onOpenChange?.(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';

export { ConfirmDialog };
