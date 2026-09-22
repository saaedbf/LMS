import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function FormContainer({ children, className }: Props) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-center mb-8 w-full max-h-[70vh] p-1 overflow-y-auto overflow-x-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
