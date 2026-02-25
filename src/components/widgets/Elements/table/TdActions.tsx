import React, { ReactNode } from "react";

export default function TdActions({ children }: { children: ReactNode }) {
  return (
    <td className="py-3 px-6 flex gap-2  border justify-center border-gray-400 h-full ">
      {children}
    </td>
  );
}
