// app/providers.tsx
"use client";

import { ToastContainer } from "react-toastify";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastContainer position="bottom-right" className="z-50" />
      {children}
    </>
  );
}
