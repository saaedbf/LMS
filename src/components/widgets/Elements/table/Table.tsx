import React, { ReactNode } from "react";

export default function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow table-b">
      <table className="w-full   table-auto border border-white">
        {children}
      </table>
    </div>
  );
}
