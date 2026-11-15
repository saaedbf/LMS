"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BsArrowRightShort } from "react-icons/bs";
import { MdManageHistory } from "react-icons/md";
import { LogOut, KeyRound, X, Eye, EyeOff } from "lucide-react";

import NewAsideMenu from "./NewAsideMenu";
import { authClient } from "@/lib/auth-client";

type SystemRole = "MASTER" | "USER";
type SchoolRole = "MANAGER" | "DEPUTY" | "TEACHER" | "STUDENT";

interface NewAsideProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    systemRole?: SystemRole | null;
  };
  role: SchoolRole | null;
  permissions?: string[]; // ⬅️ اضافه کنید
}

export default function NewAside({
  user,
  role,
  permissions = [],
}: NewAsideProps) {
  const [open, setOpen] = useState(true);
  const [innerWidth, setInnerWidth] = useState(0);

  // استیت‌های مربوط به خروج و مودال تغییر رمز عبور

  const [isModalOpen, setIsModalOpen] = useState(false);

  // فرم تغییر رمز عبور

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 800) {
        setOpen(false);
      }
      setInnerWidth(window.innerWidth);
    }
  }, []);

  const roleLabels: Record<string, string> = {
    MASTER: "مستر",
    MANAGER: "مدیر",
    DEPUTY: "معاون",
    TEACHER: "معلم",
    STUDENT: "دانش‌آموز",
  };

  const systemRole = user.systemRole ?? "USER";

  return (
    <>
      <aside
        className={`${open && innerWidth < 800 ? "flex absolute z-30" : "flex z-30"}`}
      >
        <div
          className={`bg-DarkPurple h-screen p-5 pt-8 transition-all flex flex-col duration-300 relative ${
            open ? "w-72" : "w-20"
          }`}
        >
          <BsArrowRightShort
            onClick={() => setOpen(!open)}
            className={`bg-white text-DarkPurple text-3xl rounded-full absolute -left-4 top-9 border border-DarkPurple cursor-pointer z-10 ${
              !open && "rotate-180"
            } `}
          />

          <div className="inline-flex border-b-2 border-LightWhite pb-4">
            <MdManageHistory
              className={`bg-amber-300 text-4xl w-10 rounded cursor-pointer block ml-2 float-right duration-500 ${
                open && "rotate-[360deg]"
              }`}
            />
            <h1
              className={`text-white origin-right font-medium text-2xl ${
                !open && "hidden scale-0"
              } `}
            >
              مدیریت مدارس
            </h1>
          </div>

          <NewAsideMenu
            open={open}
            systemRole={systemRole}
            schoolRole={role ?? "STUDENT"}
            permissions={permissions} // ⬅️ اضافه کنید
          />
        </div>
      </aside>

      {/* مودال تغییر رمز عبور */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* هدر مودال */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="text-amber-400" size={18} />
                <h3 className="font-bold text-sm">تغییر کلمه عبور</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه فرم */}
          </div>
        </div>
      )}
    </>
  );
}
