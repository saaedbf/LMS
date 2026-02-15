import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <header className="bg-violet-800 flex shadow sticky top-0 px-6 py-4 justify-between text-white ">
      <div className="flex  items-center  gap-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-500"></div>
        <nav className="hidden md:flex gap-4 text-sm text-white">
          <Link href="/" className="hover:font-IransansBold transition">
            تماس با ما
          </Link>
          <Link href="/" className="hover:font-IransansBold transition">
            {" "}
            درباره ما
          </Link>
          <Link href="/" className="hover:font-IransansBold transition">
            {" "}
            سایر
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          name=""
          id=""
          placeholder="جست وجو ..."
          className="border rounded-lg py-2 px-3 text-sm focus:outline-none"
        />
      </div>
    </header>
  );
}
