import { AlertDialogFooter } from "@/components/ui/alert-dialog";

import React from "react";
import LoaderBtn from "./LoaderBtn";
import CancleBtn from "./CancleBtn";
import SubmitBtn from "./SubmitBtn";
type Props = {
  txtCancel?: string;
  txtSubmit?: string;
  className?: string;
  isValid?: boolean;
  isSubmitting?: boolean;
  setOpen: (arg0: boolean) => void;
};
export default function FromActionBtns({
  txtCancel,
  txtSubmit,
  isSubmitting,
  setOpen,
}: Props) {
  return (
    <AlertDialogFooter className="flex gap-2 p-3 bg-blue-200 rounded-b-lg w-full">
      <CancleBtn txtCancel={txtCancel} setOpen={setOpen} />
      {txtSubmit &&
        (isSubmitting ? <LoaderBtn /> : <SubmitBtn txtSubmit={txtSubmit} />)}
    </AlertDialogFooter>
  );
}
