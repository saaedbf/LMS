// components/widgets/Elements/SubmitBtn.tsx
"use client";

import React from "react";

type Props = {
  txtSubmit: string;
};

export default function SubmitBtn({ txtSubmit }: Props) {
  return (
    <button
      type="submit"
      // ⬅️ این دو خط کلید حل مشکل
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
      className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {txtSubmit}
    </button>
  );
}
