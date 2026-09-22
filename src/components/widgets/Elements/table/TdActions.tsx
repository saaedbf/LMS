// components/widgets/Elements/table/TdActions.tsx
import React, { ReactNode } from "react";

export default function TdActions({ children }: { children: ReactNode }) {
  return (
    <td className="px-6 py-3 border border-gray-400">
      <div className="flex items-center justify-center gap-2">{children}</div>
    </td>
  );
}
