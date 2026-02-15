import React, { ReactNode } from "react";

export default function TitlePage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-blue-300 text-DarkPurple mb-2 shadow-lg rounded-lg p-3 text-lg font-semibold mx-auto">
      {children}
    </div>
  );
}
