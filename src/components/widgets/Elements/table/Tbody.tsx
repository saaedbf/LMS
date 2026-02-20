import React, { ReactNode } from "react";

export default function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="text-gray-600 text-sm">{children}</tbody>;
}
