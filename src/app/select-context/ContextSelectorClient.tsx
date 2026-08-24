"use client";

import { setActiveContext } from "@/actions/authActions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Assignment = {
  id: number;
  role: string;
  school: {
    title: string;
  };
  academicYear: {
    title: string;
  };
};

export default function ContextSelectorClient({
  initialAssignments,
  title,
}: {
  initialAssignments: Assignment[];
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (id: number) => {
    startTransition(async () => {
      await setActiveContext(id);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-xl font-bold text-gray-800">
        {title}
      </h1>

      <div className="space-y-4">
        {initialAssignments.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={isPending}
            onClick={() => handleSelect(item.id)}
            className="group flex w-full items-center justify-between rounded-xl border-2 border-gray-50 p-4 text-right transition-all hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div>
              <p className="font-bold text-gray-700 group-hover:text-blue-700">
                {item.school.title}
              </p>
              <p className="text-sm text-gray-500">
                سال تحصیلی: {item.academicYear.title}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="mb-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                {item.role}
              </span>
            </div>
          </button>
        ))}
      </div>

      {isPending && (
        <p className="mt-4 text-center text-sm text-blue-600 animate-pulse">
          در حال ورود به سیستم...
        </p>
      )}
    </div>
  );
}
