"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";

type SubMenuItem = {
  title: string;
  href: string;
};

type MenuItem = {
  title: string;
  href: string;
  icon: ReactNode;
  color?: string;
  bgColor?: string;
  spacing?: boolean;
  subMenu?: boolean;
  subMenuItems?: SubMenuItem[];
};

type Props = {
  item: MenuItem;
  open: boolean;
};

export default function NewAsideLink({ item, open }: Props) {
  const pathname = usePathname();
  const [subOpen, setSubOpen] = useState(false);

  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  const hasSubMenu =
    item.subMenu && item.subMenuItems && item.subMenuItems.length > 0;

  // ⬅️ اگر زیرمنو دارد
  if (hasSubMenu) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSubOpen(!subOpen)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive
              ? "bg-white/10 text-white"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="flex-shrink-0 text-lg">{item.icon}</span>

          {open && (
            <>
              <span className="flex-1 truncate text-right font-medium">
                {item.title}
              </span>
              {subOpen ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
            </>
          )}
        </button>

        {/* زیرمنوها */}
        {open && subOpen && (
          <div className="mr-8 mt-1 flex flex-col gap-1 border-r border-white/10 pr-3">
            {item.subMenuItems!.map((sub) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                    isSubActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {sub.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ⬅️ لینک ساده
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-white/10 text-white"
          : "text-gray-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="flex-shrink-0 text-lg">{item.icon}</span>
      {open && <span className="truncate font-medium">{item.title}</span>}
    </Link>
  );
}
