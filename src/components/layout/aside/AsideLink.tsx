import Link from "next/link";
import React from "react";

export default function AsideLink({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className=" p-3  bg-white rounded-md text-indigo-600 font-Iransans hover:bg-slate-100 transition-all
      hover:pr-6 border-b duration-500 hover:font-IransansMedium"
    >
      {title}
    </Link>
  );
}
