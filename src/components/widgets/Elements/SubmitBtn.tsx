import React from "react";
import { GoIssueClosed } from "react-icons/go";

export default function SubmitBtn({
  txtSubmit,
  className,
}: {
  txtSubmit?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={`bg-lime-600 flex gap-2 items-center transition-all hover:bg-lime-800 px-2 py-[4px] text-white rounded-md ${className}`}
    >
      {txtSubmit} <GoIssueClosed />
    </button>
  );
}
