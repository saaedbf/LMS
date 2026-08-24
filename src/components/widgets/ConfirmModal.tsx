"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

type ConfirmModalProps = {
  children?: ReactNode;
  trigger: ReactNode;
  title: string;
  desc?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  contentClassName?: string;
  confirmButtonClassName?: string;
};

export default function ConfirmModal({
  children,
  trigger,
  title,
  desc = "",
  open,
  setOpen,
  onConfirm,
  confirmText = "تأیید",
  cancelText = "انصراف",
  loading = false,
  contentClassName = "",
  confirmButtonClassName = "bg-amber-600 hover:bg-amber-700",
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div dir="rtl">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

        <AlertDialogContent className={`p-0 ${contentClassName}`} dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="rounded-t-lg bg-DarkPurple p-3 text-right text-white">
              {title}
            </AlertDialogTitle>

            {desc && (
              <AlertDialogDescription className="px-3 text-right">
                {desc}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {children}

          <div className="flex justify-end gap-2 px-4 pb-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOpen(false);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                void handleConfirm();
              }}
              className={`rounded-md px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmButtonClassName}`}
            >
              {loading ? "در حال انجام..." : confirmText}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
