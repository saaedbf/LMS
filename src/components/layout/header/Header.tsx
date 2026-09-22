import Link from "next/link";
import React from "react";

export default function Header({
  schoolName,
  year,
}: {
  schoolName?: string;
  year?: string;
}) {
  return (
    <header className="bg-violet-800 flex shadow sticky top-0 px-6 py-4 justify-between text-white z-20">
      <div className="flex items-center gap-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-500"></div>
        <div className="flex flex-col">
          <span className="font-bold text-sm md:text-base">
            {schoolName || "سامانه لمی"}
          </span>
          <span className="text-[10px] opacity-80">سال تحصیلی: {year}</span>
        </div>
      </div>

      <nav className="hidden md:flex gap-4 text-sm text-white items-center">
        {/* <Link href="/" className="hover:font-bold transition">
          تماس با ما
        </Link>
        <Link href="/" className="hover:font-bold transition">
          درباره ما
        </Link> */}
      </nav>
    </header>
  );
}
