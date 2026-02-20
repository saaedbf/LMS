import React, { ReactNode } from "react";

export default function Th({ children }: { children: ReactNode }) {
  return <th className="py-3 px-6 text-right">{children}</th>;
}
