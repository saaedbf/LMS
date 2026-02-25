import React, { ReactNode } from "react";

export default function ThActions({ children }: { children: ReactNode }) {
  return <th className="py-3 px-6 text-center">{children}</th>;
}
