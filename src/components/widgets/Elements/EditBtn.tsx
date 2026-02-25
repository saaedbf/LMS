import React from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinFill } from "react-icons/ri";

export default function EditBtn({ ...props }) {
  return (
    <button
      {...props}
      className=" px-2 py-1 rounded-md transition-all  items-center bg-blue-600  transform  hover:scale-110 flex gap-2 hover:bg-blue-500 text-white"
    >
      <span>ویرایش</span>
      <FaEdit size={14} fill="white" />
    </button>
  );
}
