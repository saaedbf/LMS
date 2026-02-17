import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  trigger: ReactNode;
  title: string;
  desc: string;
  setOpen: (arg0: boolean) => void;
  open: boolean;
};
export default function ActionModal({
  children,
  trigger,
  title,
  desc = "",
  setOpen,
  open,
}: Props) {
  return (
    <div dir="rtl">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        <AlertDialogContent className="p-0" dir="rtl">
          <AlertDialogHeader className="   text-white">
            <AlertDialogTitle className="text-right p-3 rounded-t-lg bg-DarkPurple">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="px-2 text-right">
              {desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {children}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
