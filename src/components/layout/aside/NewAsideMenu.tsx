import React from "react";
import NewAsideLink from "./NewAsideLink";
import { MdDashboard } from "react-icons/md";
import {
  managerMenuItems,
  masterMenuItems,
  MenuItem,
} from "@/lib/hooks/menuItems";

type SystemRole = "MASTER" | "USER";
type SchoolRole = "MANAGER" | "DEPUTY" | "TEACHER" | "STUDENT";

interface NewAsideMenuProps {
  open: boolean;
  systemRole?: SystemRole | null;
  schoolRole?: SchoolRole | null;
}

function getMenuItems(
  systemRole?: SystemRole | null,
  schoolRole?: SchoolRole | null,
): MenuItem[] {
  // اگر نقش سراسری MASTER بود، منوی مستر اولویت دارد
  if (systemRole === "MASTER") {
    return masterMenuItems;
  }

  // در غیر این صورت بر اساس نقش فعال مدرسه‌ای
  switch (schoolRole) {
    case "MANAGER":
    case "DEPUTY":
      return managerMenuItems;

    default:
      return [
        {
          title: "داشبورد",
          href: "/dashboard",
          spacing: false,
          subMenu: false,
          subMenuItems: [],
          icon: <MdDashboard />,
        },
      ];
  }
}

export default function NewAsideMenu({
  open,
  systemRole,
  schoolRole,
}: NewAsideMenuProps) {
  const menuItems = getMenuItems(systemRole, schoolRole);

  return (
    <div>
      <ul className="mt-6 flex flex-col">
        {menuItems.map((item) => (
          <NewAsideLink item={item} key={item.title} open={open} />
        ))}
      </ul>
    </div>
  );
}
