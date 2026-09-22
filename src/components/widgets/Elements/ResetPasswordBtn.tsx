"use client";

import { KeyRound } from "lucide-react";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
};

export default function ResetPasswordBtn({
  onClick,
  disabled = false,
  title = "ریست کلمه عبور",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <KeyRound size={14} />
      ریست رمز
    </button>
  );
}
