import React, { ReactNode } from "react";
type Props = {
  children: ReactNode;
  className?: string;
};
export default function FormContainer({ children, className }: Props) {
  return (
    <div className={`flex flex-col gap-2 items-center mb-8 ${className}`}>
      {children}
    </div>
  );
}
