import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";
import { GoIssueClosed } from "react-icons/go";

type Props = {
  children: ReactNode;
  trigger: ReactNode;
  title: string;
  desc: string;
  btnText: string;
  btnclass: string;
  onclick: () => void;
  setOpen: () => void;
  open: boolean;
};
export default function ActionModal({
  children,
  trigger,
  title,
  desc = "",
  btnText,
  btnclass = "",
  onclick,
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
            <AlertDialogDescription className="p-2 text-right">
              {desc}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-2">{children}</div>

          <AlertDialogFooter className="flex gap-2 p-3 bg-blue-200 rounded-b-lg">
            <AlertDialogCancel className="bg-gray-300">
              {btnText ? "انصراف" : "بستن"}{" "}
            </AlertDialogCancel>
            {btnText && (
              <AlertDialogAction
                className={`bg-lime-600 hover:bg-lime-800 ${btnclass}`}
                onClick={onclick}
              >
                {btnText} <GoIssueClosed />
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
