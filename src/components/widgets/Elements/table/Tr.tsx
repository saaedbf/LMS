import React, { ReactNode } from "react";

export default function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-100">{children}</tr>
  );
}
