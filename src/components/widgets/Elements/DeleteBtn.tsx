import React from "react";
import { RiDeleteBinFill } from "react-icons/ri";

export default function DeleteBtn({ ...props }) {
  return (
    <button
      {...props}
      className=" px-2 py-1 rounded-md transition-all bg-red-600 items-center  transform  hover:scale-110 flex gap-2 hover:bg-red-500 text-white"
    >
      <span>حذف</span>
      <RiDeleteBinFill size={14} fill="white" />
    </button>
  );
}
