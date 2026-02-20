import React, { ReactNode } from "react";

export default function HeadTr({ children }: { children: ReactNode }) {
  return (
    <tr className="bg-DarkPurple text-white uppercase text-sm leading-normal">
      {children}
    </tr>
  );
}
