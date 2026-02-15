"use client";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import { BiSolidDashboard } from "react-icons/bi";
import { FaChevronDown } from "react-icons/fa";
import { IoChevronDownSharp } from "react-icons/io5";
type subMenuItems = {
  title: string;
  href: string;
};
type Props = {
  open: boolean;
  item: {
    title: string;
    href: string;
    spacing?: boolean;
    subMenu?: boolean;
    subMenuItems: subMenuItems[];
    icon: ReactNode;
  };
};
export default function NewAsideLink({ item, open }: Props) {
  const [subMenuOpen, setSubmenuOpem] = useState(false);
  return (
    <li
      key={item.title}
      className={`text-gray-300 text-sm  cursor-pointer 
               transition
               ${item.spacing ? "mt-9" : "mt-2"}
              `}
    >
      {!item.subMenu ? (
        <>
          <Link
            href={item.href}
            className="flex items-center gap-x-4 p-2 rounded-md   hover:bg-LightWhite"
          >
            <span className="text-2xl block float-right">{item.icon}</span>
            <span
              className={`text-base font-medium flex-1 duration-200 ${!open && "hidden"} 
                    `}
            >
              {item.title}
            </span>
          </Link>
        </>
      ) : (
        <>
          <div
            className="flex items-center justify-between transition-all p-2 rounded-md  duration-500  hover:bg-LightWhite"
            onClick={() => setSubmenuOpem(!subMenuOpen)}
          >
            <div className="flex items-center gap-x-4">
              <span className="text-2xl block float-right">{item.icon}</span>
              <span
                className={`text-base font-medium flex-1 duration-200 ${!open && "hidden"} 
                    `}
              >
                {item.title}
              </span>
            </div>
            <span className="text-2xl block float-right">
              <IoChevronDownSharp
                className={`${subMenuOpen && "rotate-180"} ${!open && "hidden"}`}
              />
            </span>
          </div>
          <div className="flex flex-col mt-2   ">
            {item.subMenuItems &&
              open &&
              item.subMenuItems.map((subItem) => (
                <Link
                  href={subItem.href}
                  key={subItem.title}
                  className={`pr-8 py-2 rounded-md hover:bg-LightWhite ${!subMenuOpen && "hidden"}`}
                >
                  <span>{subItem.title}</span>
                </Link>
              ))}
          </div>
        </>
      )}
    </li>
  );
}
