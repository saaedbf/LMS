import React from "react";
import Brand from "./Brand";
import UserRole from "./UserRole";
import AsideMenu from "./AsideMenu";

export default function Aside() {
  return (
    <aside className="hidden md:flex flex-col bg-white w-64 min-h-screen shadow-lg">
      <Brand />
      <UserRole />
      <AsideMenu />
    </aside>
  );
}
