"use client";

import React, { useState, useEffect } from "react";
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
  connectDarsToReshteh,
  disconnectDarsFromReshteh,
  getAvailableDars,
} from "@/actions/darsPayeReshtehActions";

type AssignedItem = {
  id: string;
  units: number;
  paye: { id: number; title: string };
  reshtehTadris: { id: string; title: string };
};

interface Props {
  reshtehId: number;
  payes: { id: number; title: string }[];
  assignedCourses: AssignedItem[];
  totalCount: number;
  pageSize: number;
}

export default function ManageReshtehCoursesForm({
  reshtehId,
  payes,
  assignedCourses,
  totalCount,
  pageSize,
}: Props) {
  const [selectedPaye, setSelectedPaye] = useState<number>(0);
  const [selectedDars, setSelectedDars] = useState<string>("");
  const [units, setUnits] = useState<number>(1);

  const [availableDars, setAvailableDars] = useState<
    { id: string; title: string }[]
  >([]);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] =
    useState<AssignedItem | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  // لود کردن دروس در دسترس هنگام تغییر پایه
  useEffect(() => {
    if (selectedPaye > 0) {
      setSelectedDars("");
      getAvailableDars(reshtehId, selectedPaye).then((res) => {
        setAvailableDars(res);
      });
    } else {
      setAvailableDars([]);
    }
  }, [selectedPaye, reshtehId]);

  const handleAdd = async () => {
    if (!selectedPaye || !selectedDars || units < 1) {
      toast.warning("لطفا پایه، درس و تعداد واحد معتبر وارد کنید");
      return;
    }

    setLoadingAdd(true);
    const res = await connectDarsToReshteh(
      reshtehId,
      selectedPaye,
      selectedDars,
      units,
    );

    if (res.status === "success") {
      toast.success("درس با موفقیت به برنامه اضافه شد");
      setSelectedDars("");
      setUnits(1);
      // تازه کردن لیست دروس در دسترس
      const updatedList = await getAvailableDars(reshtehId, selectedPaye);
      setAvailableDars(updatedList);
    } else {
      toast.error(String(res.error));
    }
    setLoadingAdd(false);
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="bg-indigo-50 p-4 rounded-lg space-y-4">
        <h2 className="text-sm font-semibold text-indigo-900">
          تعریف درس جدید برای این رشته:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              پایه تحصیلی:
            </label>
            <select
              value={selectedPaye}
              onChange={(e) => setSelectedPaye(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value={0}>انتخاب پایه ...</option>
              {payes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <SearchableSelect
              title="انتخاب درس (رشته تدریس):"
              options={availableDars}
              value={selectedDars}
              onChange={(value) => setSelectedDars(String(value))}
              placeholder={
                selectedPaye > 0
                  ? "جست‌وجو و انتخاب درس..."
                  : "ابتدا پایه را انتخاب کنید"
              }
              disabled={selectedPaye === 0}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              تعداد واحد:
            </label>
            <input
              type="number"
              min={1}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAdd}
            disabled={!selectedPaye || !selectedDars || loadingAdd}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-all text-sm"
          >
            <Plus size={18} />
            {loadingAdd ? "در حال ثبت..." : "افزودن درس به برنامه"}
          </button>
        </div>
      </div>

      <DataTableLayout totalCount={totalCount}>
        <Table>
          <thead>
            <HeadTr>
              <SortableTh field="paye.title" sortable title="پایه تحصیلی">
                <ColumnSearch field="paye.title" />
              </SortableTh>

              <SortableTh
                field="reshtehTadris.title"
                sortable
                title="نام درس (رشته تدریس)"
              >
                <ColumnSearch field="reshtehTadris.title" />
              </SortableTh>

              <SortableTh field="units" sortable title="تعداد واحد">
                <ColumnSearch field="units" />
              </SortableTh>

              <ThActions>عملیات</ThActions>
            </HeadTr>
          </thead>

          <Tbody>
            {assignedCourses.map((item) => (
              <Tr key={item.id}>
                <Td>{item.paye.title}</Td>
                <Td>{item.reshtehTadris.title}</Td>
                <Td>{item.units}</Td>
                <TdActions>
                  <DeleteBtn
                    onClick={() => {
                      setSelectedItemToDelete(item);
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
          if (!v) setSelectedItemToDelete(null);
        }}
        item={selectedItemToDelete}
        getTitle={() => "حذف درس از برنامه رشته"}
        getDescription={(item) =>
          `آیا از حذف درس ${item.reshtehTadris.title} مربوط به پایه ${item.paye.title} مطمئن هستید؟`
        }
        onDelete={async (item) => {
          return await disconnectDarsFromReshteh(item.id, reshtehId);
        }}
      />

      <Pagination pageSize={pageSize} totalCount={totalCount} />
    </div>
  );
}
