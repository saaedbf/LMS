import React from "react";
import { FaArrowRotateLeft } from "react-icons/fa6";

export default function LoaderBtn({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={`bg-lime-800 flex gap-2 items-center  text-white px-2 py-[4px] rounded-md ${className}`}
      disabled
    >
      <span> در حال انجام</span>
      <FaArrowRotateLeft
        size={16}
        fill="white"
        className="animate-spin  text-white"
      />
    </button>
  );
}
