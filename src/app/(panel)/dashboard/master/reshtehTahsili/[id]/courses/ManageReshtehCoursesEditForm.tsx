"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { updateDarsUnits } from "@/actions/darsPayeReshtehActions";

type AssignedItem = {
  id: string;
  units: number;
  paye: { id: number; title: string };
  reshtehTadris: { id: string; title: string };
};

export default function EditUnitsForm({
  item,
  reshtehId,
  setOpen,
}: {
  item: AssignedItem;
  reshtehId: number;
  setOpen: (open: boolean) => void;
}) {
  const [units, setUnits] = useState<number>(item.units);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (units < 1 || units > 10) {
      toast.error("تعداد واحد باید بین ۱ تا ۱۰ باشد");
      return;
    }

    startTransition(async () => {
      const res = await updateDarsUnits(item.id, units, reshtehId);
      if (res.status === "error") {
        toast.error(res.error);
      } else {
        toast.success("تعداد واحد با موفقیت ویرایش شد");
        setOpen(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-sm">
      {/* نمایش اطلاعات درس */}
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
        <p>
          پایه: <strong className="text-zinc-900">{item.paye.title}</strong>
        </p>
        <p className="mt-1">
          درس:{" "}
          <strong className="text-zinc-900">{item.reshtehTadris.title}</strong>
        </p>
      </div>

      <div>
        <label className="mb-1 block font-medium text-zinc-700">
          تعداد واحد جدید
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
          autoFocus
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
