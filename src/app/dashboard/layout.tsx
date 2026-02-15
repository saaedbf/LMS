import React, { ReactNode } from "react";

import Header from "@/components/layout/header/Header";
import NewAside from "@/components/layout/aside/NewAside";

export default function Dashboardlayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <NewAside />
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
