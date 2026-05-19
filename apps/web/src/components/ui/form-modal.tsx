'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  children,
  maxWidth = 'sm:max-w-lg',
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-[#1A1A1A] border-[#2A2A2A] text-white ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="text-white text-lg">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
