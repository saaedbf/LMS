import React from "react";
import AsideLink from "./AsideLink";

export default function AsideMenu() {
  const menuItem = [
    { title: "داشبورد", href: "/" },
    { title: "مدیریت کاربران", href: "/" },
    { title: "مدیریت دروس", href: "/" },
    { title: "مدیریت دوره تحصیلی", href: "/" },
    { title: "مدیریت  پست", href: "/" },
  ];
  return (
    <div className="p-4 bg-indigo-50  h-[100%]">
      <p className="text-slate-500 mb-2">عملیات</p>
      <nav className=" flex flex-col rounded-lg shadow-lg">
        {menuItem.map((item) => (
          <AsideLink key={item.title} href={item.href} title={item.title} />
        ))}
      </nav>
    </div>
  );
}
