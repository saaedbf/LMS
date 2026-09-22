"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  href: string;
  label: string;
  className?: string;
};

export default function BackButton({ href, label, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex bg-orange-200 py-2 px-2 shadow-sm rounded-sm items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 ${className}`}
    >
      <ArrowRight size={16} />
      <span>{label}</span>
    </Link>
  );
}
