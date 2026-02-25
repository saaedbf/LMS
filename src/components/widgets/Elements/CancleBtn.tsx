import React from "react";

export default function CancleBtn({
  txtCancel,
  setOpen,
}: {
  txtCancel?: string;
  setOpen: (arg0: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="bg-gray-300 px-2 py-[4px] hover:bg-gray-400 transition-all border border-gray-400 rounded-md"
      onClick={() => setOpen(false)}
    >
      {txtCancel ? txtCancel : "انصراف"}
    </button>
  );
}
