"use client";

import React, { useState } from "react";
import { Paye } from "@prisma/client";
import {
  connectPayeToDoreh,
  disconnectPayeFromDoreh,
} from "@/actions/dorehPayeActions";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  dorehId: number;
  assignedPayes: Paye[];
  availablePayes: Paye[];
}

export default function ManageDorehPayesForm({
  dorehId,
  assignedPayes,
  availablePayes,
}: Props) {
  const [selectedToAdd, setSelectedToAdd] = useState<string>("");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!selectedToAdd) return;
    setLoadingId(Number(selectedToAdd));
    const res = await connectPayeToDoreh(dorehId, Number(selectedToAdd));
    if (res.status === "success") {
      toast.success("پایه با موفقیت اضافه شد");
      setSelectedToAdd("");
    } else {
      toast.error(res.error);
    }
    setLoadingId(null);
  };

  const handleRemove = async (payeId: number) => {
    if (!confirm("آیا از حذف این پایه از این دوره اطمینان دارید؟")) return;
    setLoadingId(payeId);
    const res = await disconnectPayeFromDoreh(dorehId, payeId);
    if (res.status === "success") {
      toast.info("پایه از لیست دوره حذف شد");
    } else {
      toast.error(res.error);
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* بخش افزودن پایه جدید */}
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-blue-50 p-4 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            انتخاب پایه برای افزودن:
          </label>
          <select
            value={selectedToAdd}
            onChange={(e) => setSelectedToAdd(e.target.value)}
            className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- یک پایه را انتخاب کنید --</option>
            {availablePayes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedToAdd || loadingId !== null}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          <Plus size={18} />
          {loadingId === Number(selectedToAdd)
            ? "در حال ثبت..."
            : "افزودن به دوره"}
        </button>
      </div>

      {/* لیست پایه‌های فعلی */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
          پایه‌های اختصاص یافته به این دوره
          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
            {assignedPayes.length} مورد
          </span>
        </h3>

        {assignedPayes.length === 0 ? (
          <p className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            هیچ پایه‌ای برای این دوره ثبت نشده است.
          </p>
        ) : (
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-sm font-bold text-gray-600">
                    عنوان پایه
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-600 w-24 text-center">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignedPayes.map((paye) => (
                  <tr
                    key={paye.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-700">{paye.title}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemove(paye.id)}
                        disabled={loadingId === paye.id}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all disabled:opacity-30"
                        title="حذف از دوره"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
