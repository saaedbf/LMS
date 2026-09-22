import {
  MdDashboard,
  MdSettings,
  MdClass,
  MdSchool,
  MdPeople,
  MdAssignment,
  MdGrade,
  MdEventBusy,
  MdGavel,
  MdMenuBook,
  MdLibraryBooks,
  MdMarkunreadMailbox,
  MdLocationCity,
  MdMap,
  MdLayers,
} from "react-icons/md";
import { FaUserPlus } from "react-icons/fa";

export type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  spacing?: boolean;
  subMenu?: boolean;
  subMenuItems?: { title: string; href: string }[];
};

// ==========================================
// منوهای مدیر مدرسه
// ==========================================
export const managerMenuItems: MenuItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard/manager",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdDashboard />,
    color: "text-zinc-600",
    bgColor: "bg-zinc-100",
  },
  {
    title: "تنظیمات اولیه",
    href: "/dashboard/manager/settings",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdSettings />,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  {
    title: "مدیریت کلاس",
    href: "/dashboard/manager/classes",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdClass />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    title: "مدیریت دانش‌آموزان",
    href: "/dashboard/manager/students",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdSchool />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "مدیریت معلمان",
    href: "/dashboard/manager/teachers",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdPeople />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    title: "تخصیص معلم به کلاس",
    href: "/dashboard/manager/class-course",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdAssignment />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "تعریف دوره ثبت نمره",
    href: "/dashboard/manager/grade-periods",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdGrade />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    title: "مدیریت غیبت",
    href: "/dashboard/manager/absence",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdEventBusy />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  {
    title: "مدیریت موارد انضباطی",
    href: "/dashboard/manager/disiplinary",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdGavel />,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

// ==========================================
// منوهای Master (مدیر کل)
// ==========================================
export const masterMenuItems: MenuItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard/master",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdDashboard />,
    color: "text-zinc-600",
    bgColor: "bg-zinc-100",
  },

  {
    title: "مدیریت مدارس",
    href: "/dashboard/master/school",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdSchool />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "مدیریت دوره تحصیلی",
    href: "/dashboard/master/dorehTahsili",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdMenuBook />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    title: "مدیریت رشته تحصیلی",
    href: "/dashboard/master/reshtehTahsili",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdLibraryBooks />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "مدیریت رشته تدریس",
    href: "/dashboard/master/reshtehTadris",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdClass />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    title: "مدیریت پایه",
    href: "/dashboard/master/paye",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdLayers />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    title: "مدیریت استان",
    href: "/dashboard/master/ostan",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdLocationCity />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  {
    title: "مدیریت مناطق",
    href: "/dashboard/master/region",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdMap />,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    title: "مدیریت پست",
    href: "/dashboard/master/post",
    spacing: false,
    subMenu: false,
    subMenuItems: [],
    icon: <MdMarkunreadMailbox />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];
