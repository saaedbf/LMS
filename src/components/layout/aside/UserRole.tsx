import React from "react";

export default function UserRole() {
  return (
    <div className="flex gap-3 p-4 items-center border-b">
      <div className="w-12 h-12 rounded-full bg-indigo-600"></div>
      <div className="flex flex-col items-center justify-center">
        <p className="font-IransansMedium ">سعید باقری</p>
        <span className="text-slate-500 text-sm">مدیر سامانه</span>
      </div>
    </div>
  );
}
