"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import Pagination from "@/components/widgets/Pagination";
import Table from "@/components/widgets/Elements/table/Table";
import Tbody from "@/components/widgets/Elements/table/Tbody";
import Td from "@/components/widgets/Elements/table/Td";
import Tr from "@/components/widgets/Elements/table/Tr";
import HeadTr from "@/components/widgets/Elements/table/HeaddTr";
import SortableTh from "@/components/widgets/Elements/table/SortableTh";
import ColumnSearch from "@/components/widgets/Elements/table/ColumnSearch";
import TdActions from "@/components/widgets/Elements/table/TdActions";
import ThActions from "@/components/widgets/Elements/table/ThActions";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";
import DeleteConfirmModal from "@/components/widgets/DeleteConfirmModal";
import SearchableSelect from "@/components/widgets/Elements/SearchableSelect";
import DataTableLayout from "@/components/widgets/DataTableLayout";
import {
  connectReshtehToDoreh,
  disconnectReshtehFromDoreh,
} from "@/actions/dorehReshtehActions";

type ReshtehItem = {
  id: number;
  title: string;
};

interface Props {
  dorehId: number;
  assignedReshtehs: ReshtehItem[];
  availableReshtehs: ReshtehItem[];
  totalCount: number;
  pageSize: number;
}

export default function ManageDorehReshtehsForm({
  dorehId,
  assignedReshtehs,
  availableReshtehs,
  totalCount,
  pageSize,
}: Props) {
  const [selectedToAdd, setSelectedToAdd] = useState<number>(0);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReshtehItem | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const handleAdd = async () => {
    if (!selectedToAdd) return;

    setLoadingId(selectedToAdd);
    const res = await connectReshtehToDoreh(dorehId, selectedToAdd);

    if (res.status === "success") {
      toast.success("رشته با موفقیت اضافه شد");
      setSelectedToAdd(0);
    } else {
      toast.error(String(res.error));
    }

    setLoadingId(null);
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-blue-50 p-4 rounded-lg">
        <div className="flex-1">
          <SearchableSelect
            title="انتخاب رشته برای افزودن:"
            options={availableReshtehs}
            value={selectedToAdd}
            onChange={(value) => setSelectedToAdd(value)}
            placeholder="جست‌وجو و انتخاب رشته ..."
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedToAdd || loadingId !== null}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          <Plus size={18} />
          {loadingId === selectedToAdd ? "در حال ثبت..." : "افزودن به دوره"}
        </button>
      </div>

      <DataTableLayout totalCount={totalCount}>
        <Table>
          <thead>
            <HeadTr>
              <SortableTh field="id" sortable title="کد">
                <ColumnSearch field="id" />
              </SortableTh>

              <SortableTh field="title" sortable title="نام رشته">
                <ColumnSearch field="title" />
              </SortableTh>

              <ThActions>عملیات</ThActions>
            </HeadTr>
          </thead>

          <Tbody>
            {assignedReshtehs.map((item) => (
              <Tr key={item.id}>
                <Td>{item.id}</Td>
                <Td>{item.title}</Td>
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
      </DataTableLayout>

      <DeleteConfirmModal
        open={openDelete}
        setOpen={(v) => {
          setOpenDelete(v);
          if (!v) setSelectedItem(null);
        }}
        item={selectedItem}
        getTitle={() => "حذف رشته از دوره تحصیلی"}
        getDescription={(item) =>
          `آیا از حذف رشته با کد ${item.id} و نام ${item.title} مطمئن هستید؟`
        }
        onDelete={async (item) => {
          return await disconnectReshtehFromDoreh(dorehId, item.id);
        }}
      />

      <Pagination pageSize={pageSize} totalCount={totalCount} />
    </div>
  );
}
