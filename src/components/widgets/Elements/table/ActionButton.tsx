// components/widgets/Elements/ActionButton.tsx
import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ColorVariant =
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "purple"
  | "zinc"
  | "indigo";

type SizeVariant = "sm" | "md" | "lg";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // رنگ
  color?: ColorVariant;

  // اندازه
  size?: SizeVariant;

  // آیکن (سمت راست یا چپ)
  icon?: ReactNode;
  iconPosition?: "left" | "right";

  // متن دکمه
  children?: ReactNode;

  // فقط آیکن (بدون متن)
  iconOnly?: boolean;

  // انیمیشن hover
  hoverScale?: boolean;

  // حالت بارگذاری
  loading?: boolean;
}

const colorClasses: Record<ColorVariant, string> = {
  blue: "bg-blue-600 hover:bg-blue-500 text-white",
  emerald: "bg-emerald-600 hover:bg-emerald-500 text-white",
  amber: "bg-amber-500 hover:bg-amber-400 text-white",
  rose: "bg-rose-600 hover:bg-rose-500 text-white",
  purple: "bg-purple-600 hover:bg-purple-500 text-white",
  zinc: "bg-zinc-600 hover:bg-zinc-500 text-white",
  indigo: "bg-indigo-600 hover:bg-indigo-500 text-white",
};

// components/widgets/Elements/ActionButton.tsx
const sizeClasses: Record<SizeVariant, string> = {
  sm: "h-7 px-2 text-xs gap-1.5",
  md: "h-9 px-3 text-sm gap-2",
  lg: "h-10 px-4 text-base gap-2.5",
};

export default function ActionButton({
  color = "blue",
  size = "sm",
  icon,
  iconPosition = "right",
  children,
  iconOnly = false,
  hoverScale = true,
  loading = false,
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  const baseClasses = `
    rounded-md transition-all
    inline-flex items-center justify-center
    disabled:opacity-50 disabled:cursor-not-allowed
    ${hoverScale ? "hover:scale-110" : ""}
    ${colorClasses[color]}
    ${sizeClasses[size]}
    ${iconOnly ? "aspect-square p-0" : ""}
    ${className}
  `;

  return (
    <button {...props} disabled={disabled || loading} className={baseClasses}>
      {/* آیکن سمت چپ */}
      {icon && iconPosition === "left" && (
        <span className="flex-shrink-0">{icon}</span>
      )}

      {/* متن */}
      {!iconOnly && children && <span>{children}</span>}

      {/* آیکن سمت راست */}
      {icon && iconPosition === "right" && (
        <span className="flex-shrink-0">{icon}</span>
      )}

      {/* لودینگ */}
      {loading && (
        <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
    </button>
  );
}
