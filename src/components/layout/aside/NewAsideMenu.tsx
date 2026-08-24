import React from "react";
import NewAsideLink from "./NewAsideLink";
import { FaUsersGear } from "react-icons/fa6";
import { SiBookstack } from "react-icons/si";
import { FaAddressBook } from "react-icons/fa";
import { BsPostcardFill } from "react-icons/bs";
import { MdDashboard } from "react-icons/md";

type SystemRole = "MASTER" | "USER";
type SchoolRole = "MANAGER" | "DEPUTY" | "TEACHER" | "STUDENT";

type MenuItem = {
  title: string;
  href: string;
  spacing?: boolean;
  subMenu: boolean;
  subMenuItems: { title: string; href: string }[];
  icon: React.ReactNode;
};

interface NewAsideMenuProps {
  open: boolean;
  systemRole?: SystemRole | null;
  schoolRole?: SchoolRole | null;
}

const masterMenuItems: MenuItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard/master",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdDashboard />,
  },
  {
    title: "مدیریت کاربران",
    href: "/dashboard/master/users",
    subMenu: true,
    icon: <FaUsersGear />,
    subMenuItems: [
      { title: "افزودن کاربر", href: "/dashboard/master/users/create" },
      { title: "لیست کاربران", href: "/dashboard/master/users" },
      { title: "ویرایش کاربران", href: "/dashboard/master/users" },
    ],
  },
  {
    title: "مدیریت مدارس",
    href: "/dashboard/master/school",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [],
  },
  {
    title: "مدیریت دوره تحصیلی",
    href: "/dashboard/master/dorehTahsili",
    spacing: true,
    icon: <FaAddressBook />,
    subMenu: false,
    subMenuItems: [],
  },
  {
    title: "مدیریت رشته تحصیلی",
    href: "/dashboard/master/reshtehTahsili",
    spacing: false,
    icon: <FaAddressBook />,
    subMenu: false,
    subMenuItems: [],
  },
  {
    title: "مدیریت رشته تدریس",
    href: "/dashboard/master/reshtehTadris",
    spacing: false,
    icon: <FaAddressBook />,
    subMenu: false,
    subMenuItems: [],
  },
  {
    title: "مدیریت پست",
    href: "/dashboard/master/post",
    spacing: false,
    subMenu: false,
    icon: <BsPostcardFill />,
    subMenuItems: [],
  },
  {
    title: "مدیریت استان",
    href: "/dashboard/master/ostan",
    spacing: false,
    subMenu: false,
    icon: <BsPostcardFill />,
    subMenuItems: [],
  },
  {
    title: "مدیریت مناطق",
    href: "/dashboard/master/region",
    spacing: false,
    subMenu: false,
    icon: <BsPostcardFill />,
    subMenuItems: [],
  },
  {
    title: "مدیریت پایه",
    href: "/dashboard/master/paye",
    spacing: false,
    subMenu: false,
    icon: <BsPostcardFill />,
    subMenuItems: [],
  },
];

const managerMenuItems: MenuItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdDashboard />,
  },
  {
    title: "مدیریت کاربران مدرسه",
    href: "/dashboard/manager/users",
    subMenu: true,
    icon: <FaUsersGear />,
    subMenuItems: [
      { title: "افزودن کاربر", href: "/dashboard/manager/users/create" },
      { title: "لیست کاربران", href: "/dashboard/manager/users" },
    ],
  },
  {
    title: "مدیریت دروس",
    href: "/dashboard/manager/lessons",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [],
  },
  {
    title: "مدیریت کلاس",
    href: "/dashboard/manager/classes",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [],
  },
  {
    title: "مدیریت دانش آموزان",
    href: "/dashboard/manager/students",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [],
  },
];

const teacherMenuItems: MenuItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdDashboard />,
  },
  {
    title: "دروس من",
    href: "/dashboard/teacher/courses",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [],
  },
];

const studentMenuItems: MenuItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdDashboard />,
  },
  {
    title: "درس‌های من",
    href: "/dashboard/student/courses",
    spacing: false,
    subMenu: false,
    icon: <SiBookstack />,
    subMenuItems: [],
  },
];

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
    case "TEACHER":
      return teacherMenuItems;
    case "STUDENT":
      return studentMenuItems;
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
