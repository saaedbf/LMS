import React, { ReactNode } from "react";

export default function Td({ children }: { children: ReactNode }) {
  return (
    <th className="py-3 px-6 text-right border border-gray-400">{children}</th>
  );
}
