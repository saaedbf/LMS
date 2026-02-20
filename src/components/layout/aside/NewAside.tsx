"use client";

import React, { useEffect, useState } from "react";

import { BsArrowRightShort } from "react-icons/bs";

import NewAsideMenu from "./NewAsideMenu";
import { MdManageHistory } from "react-icons/md";
export default function NewAside() {
  const [open, setOpen] = useState(true);
  const [innerWidth, setInnerWidth] = useState(0);
  // const [open, setOpen] = useState(true);
  useEffect(() => {
    if (window.innerWidth < 800) {
      setOpen(false);
    }
    setInnerWidth(window.innerWidth);
  }, []);
  return (
    <aside
      className={`${open && innerWidth < 800 ? "flex absolute z-30" : "flex"}`}
    >
      <div
        className={`bg-DarkPurple h-screen p-5 pt-8 transition-all flex flex-col duration-300  relative ${open ? "w-72 absolute z-30" : "w-20"}`}
      >
        <BsArrowRightShort
          onClick={() => setOpen(!open)}
          className={`bg-white text-DarkPurple text-3xl rounded-full absolute -left-4
        top-9 border border-DarkPurple cursor-pointer z-10 ${!open && "rotate-180"} `}
        />
        <div className="inline-flex border-b-2 border-LightWhite pb-4">
          <MdManageHistory
            className={`bg-amber-300 text-4xl w-10 rounded cursor-pointer block ml-2 float-right duration-500 ${open && "rotate-[360deg]"}`}
          />
          <h1
            className={`text-white origin-right font-medium text-2xl ${!open && "hidden scale-0"} `}
          >
            مدیریت مدارس
          </h1>
        </div>

        <NewAsideMenu open={open} />
        {open && (
          <div className="bg-LightWhite text-gray-300 rounded-lg mt-auto flex flex-col gap-3 text-sm p-2 ">
            <p>نام : سعید باقری</p>
            <p>نقش : مدیر سامانه</p>
          </div>
        )}
      </div>
    </aside>
  );
}
