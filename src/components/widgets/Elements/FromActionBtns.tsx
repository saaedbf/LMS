import {
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import React from "react";
import { GoIssueClosed } from "react-icons/go";
type Props = {
  txtCancel?: string;
  txtSubmit?: string;
  className?: string;
  isValid?: boolean;
  setOpen: (arg0: boolean) => void;
};
export default function FromActionBtns({
  txtCancel,
  txtSubmit,
  className,
  isValid,
  setOpen,
}: Props) {
  return (
    <AlertDialogFooter className="flex gap-2 p-3 bg-blue-200 rounded-b-lg w-full">
      <button
        className="bg-gray-300 px-2 py-[4px] hover:bg-gray-400 transition-all border border-gray-400 rounded-md"
        onClick={() => setOpen(false)}
      >
        {txtCancel ? txtCancel : "انصراف"}
      </button>
      {txtSubmit && (
        <button
          type="submit"
          className={`bg-lime-600 flex gap-2 items-center transition-all hover:bg-lime-800 px-2 py-[4px] text-white rounded-md ${className}`}
        >
          {txtSubmit} <GoIssueClosed />
        </button>
      )}
    </AlertDialogFooter>
  );
}
