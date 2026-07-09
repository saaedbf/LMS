/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ActionResult } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";

type Props<T> = {
  open: boolean;
  setOpen: (v: boolean) => void;
  item: T | null;
  getTitle: (item: T) => string;
  getDescription: (item: T) => string;
  onDelete: (item: T) => Promise<ActionResult<any>>;
  onDeleted?: (item: T) => void; // برای optimistic update
};

export default function DeleteConfirmModal<T>({
  open,
  setOpen,
  item,
  getTitle,
  getDescription,
  onDelete,
}: Props<T>) {
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const result = await onDelete(item);
      console.log(result);
      if (result.status === "success") {
        toast.success(" با موفقیت حذف شد");
      } else {
        console.log("er");
        toast.error("مشکل در انجام عملیات");
      }

      //  onDeleted?.(item); // optimistic update
      setOpen(false);
    } catch {
      toast.error("خطا در حذف ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="p-0" dir="rtl">
          <AlertDialogHeader className="   text-white">
            <AlertDialogTitle className="text-right p-3 rounded-t-lg bg-DarkPurple">
              {getTitle(item)}
            </AlertDialogTitle>

            <AlertDialogDescription className="px-2 text-right">
              {getDescription(item)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-2 p-3 bg-blue-200 rounded-b-lg w-full">
            <AlertDialogCancel disabled={loading}>انصراف</AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-500"
              disabled={loading}
            >
              {loading ? "در حال حذف..." : "تایید حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
