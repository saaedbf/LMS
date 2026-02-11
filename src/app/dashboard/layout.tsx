import React, { ReactNode } from "react";
import Aside from "../components/layout/aside/Aside";

export default function Dashboardlayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Aside />
      <main>{children}</main>
    </div>
  );
}
