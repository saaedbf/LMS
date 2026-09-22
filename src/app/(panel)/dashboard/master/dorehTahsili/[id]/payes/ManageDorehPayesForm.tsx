"use client";

import React, { useState } from "react";
import { Paye } from "@prisma/client";
import {
  connectPayeToDoreh,
  disconnectPayeFromDoreh,
} from "@/actions/dorehPayeActions";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";

import Tr from "@/components/widgets/Elements/table/Tr";
import TitlePage from "@/components/widgets/TitlePage";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
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
  const [selectedItem, setSelectedItem] = useState<Paye | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const handleAdd = async () => {
    if (!selectedToAdd) return;
    setLoadingId(Number(selectedToAdd));
    const res = await connectPayeToDoreh(dorehId, Number(selectedToAdd));
    if (res.status === "success") {
      toast.success("پایه با موفقیت اضافه شد");
      setSelectedToAdd("");
    } else {
      toast.error(res.error.toString());
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
            <Table>
              <thead>
                <HeadTr>
                  <SortableTh field="id" sortable title="کد">
                    <ColumnSearch field="id" />
                  </SortableTh>

                  <SortableTh field="title" sortable title="نام">
                    <ColumnSearch field="title" />
                  </SortableTh>
                  <ThActions>عملیات</ThActions>
                </HeadTr>
              </thead>
              <Tbody>
                {assignedPayes &&
                  assignedPayes.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.id}</Td>
                      <Td> {item.title}</Td>

                      <TdActions>
                        <DeleteBtn
                          onClick={() => {
                            setSelectedItem(item);
                            setOpenDelete(true);
                          }}
                        />
                      </TdActions>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </div>
        )}
        <DeleteConfirmModal
          open={openDelete}
          setOpen={(v) => {
            setOpenDelete(v);
            if (!v) setSelectedItem(null);
          }}
          item={selectedItem}
          getTitle={() => "حذف پایه از دوره  تحصیلی"}
          getDescription={(item) =>
            `آیا از حذف پایه با کد ${item.id} و نام ${item.title} مطمئن هستید؟`
          }
          onDelete={async (item) => {
            return await disconnectPayeFromDoreh(dorehId, item.id);
          }}
        />
      </div>
    </div>
  );
}
