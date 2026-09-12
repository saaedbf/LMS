import React, { ReactNode } from "react";

export default function Table({ children }: { children: ReactNode }) {
  return (
    <table className="w-full min-w-[800px] table-auto border-collapse">
      {children}
    </table>
  );
}
