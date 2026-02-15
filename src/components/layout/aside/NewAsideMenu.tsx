import React from "react";
import NewAsideLink from "./NewAsideLink";
import { FaUsersGear } from "react-icons/fa6";
import { SiBookstack } from "react-icons/si";
import { FaAddressBook } from "react-icons/fa";
import { BsPostcardFill } from "react-icons/bs";
import { MdDashboard } from "react-icons/md";
const menuItem = [
  {
    title: "داشبورد",
    href: "/",
    spacing: false,
    subMenu: false,
    subMenuItems: [{ title: "", href: "" }],
    icon: <MdDashboard />,
  },
  {
    title: "مدیریت کاربران",
    href: "/",
    subMenu: true,
    icon: <FaUsersGear />,
    subMenuItems: [
      { title: "افزودن کاربر", href: "/" },
      { title: "حذف کاربر", href: "/" },
      { title: "ویرایش کاربر", href: "/" },
    ],
  },
  {
    title: "مدیریت دروس",
    href: "/",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [{ title: "", href: "" }],
  },
  {
    title: "مدیریت دوره تحصیلی",
    href: "/",
    spacing: true,
    icon: <FaAddressBook />,
    subMenu: false,
    subMenuItems: [{ title: "", href: "" }],
  },
  {
    title: "مدیریت  پست",
    href: "/",
    spacing: false,
    subMenu: false,
    icon: <BsPostcardFill />,
    subMenuItems: [{ title: "", href: "" }],
  },
];
export default function NewAsideMenu({ open }: { open: boolean }) {
  return (
    <div>
      <ul className="mt-6  flex flex-col  ">
        {menuItem.map((item) => (
          <NewAsideLink item={item} key={item.title} open={open} />
        ))}
      </ul>
    </div>
  );
}
