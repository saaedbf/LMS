import React, { ReactNode } from "react";
import { IoIosAddCircle } from "react-icons/io";
export default function CreateBtn({
  children,
  ...props
}: {
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className="text-white bg-green-600 py-2 px-3 rounded-md flex gap-2 hover:bg-green-500 transition-all items-center"
    >
      {children} <IoIosAddCircle />
    </button>
  );
}
